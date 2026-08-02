import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Minio from 'minio';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private minioClient: Minio.Client | null = null;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: any,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Initialize MinIO client if configured
    const storageProvider = this.configService.get<string>('STORAGE_PROVIDER', 'local');
    if (storageProvider === 'minio') {
      const endPoint = this.configService.get<string>('S3_ENDPOINT');
      const port = this.configService.get<number>('S3_PORT', 9000);
      const useSSL = this.configService.get<boolean>('S3_USE_SSL', true);
      const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
      const secretKey = this.configService.get<string>('S3_SECRET_KEY');

      if (endPoint && accessKey && secretKey) {
        this.minioClient = new Minio.Client({
          endPoint,
          port,
          useSSL,
          accessKey,
          secretKey,
        });
        this.logger.log('MinIO client initialized');
      } else {
        this.logger.warn('MinIO configuration incomplete. Falling back to local storage.');
      }
    }
  }

  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  private readonly ALLOWED_TYPES = this.configService
    .get<string>('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/webp,application/pdf,video/mp4')
    .split(',')
    .map((t) => t.trim());
  private readonly MAX_FILE_SIZE = this.configService.get<number>('MAX_FILE_SIZE', 5242880); // 5MB
  private readonly BUCKET_NAME = this.configService.get<string>('S3_BUCKET', 'ayan-taraz');

  async ensureMinioBucket() {
    if (!this.minioClient) return;

    const bucketExists = await this.minioClient.bucketExists(this.BUCKET_NAME);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.BUCKET_NAME);
      this.logger.log(`Created MinIO bucket: ${this.BUCKET_NAME}`);
    }
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadFile(
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
    uploadedById: string,
  ): Promise<{
    id: string;
    name: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }> {
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size of ${this.MAX_FILE_SIZE} bytes`,
      );
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;

    let fileUrl: string;
    let filePath: string;

    // Use MinIO if available, otherwise fall back to local storage
    if (this.minioClient) {
      await this.ensureMinioBucket();
      const objectName = `uploads/${fileName}`;
      await this.minioClient.putObject(
        this.BUCKET_NAME,
        objectName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
      fileUrl = `/uploads/${fileName}`;
      filePath = objectName;
      this.logger.log(`Uploaded file to MinIO: ${objectName}`);
    } else {
      // Fallback to local storage (for development)
      filePath = path.join(this.UPLOAD_DIR, fileName);
      await this.ensureUploadDir();
      await fs.writeFile(filePath, file.buffer);
      fileUrl = `/uploads/${fileName}`;
      this.logger.warn(`Using local storage for file: ${filePath} (MinIO not configured)`);
    }

    // Get file dimensions for images
    let dimensions: string | null = null;
    if (file.mimetype.startsWith('image/')) {
      // In production, use a library like 'sharp' to get dimensions
      // For now, use placeholder or implement later
      dimensions = null;
    }

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        name: file.originalname,
        fileName,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        dimensions,
        uploadedById: uploadedById,
      },
    });

    return {
      id: media.id,
      name: media.name,
      fileName: media.fileName,
      fileUrl: media.fileUrl,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
    };
  }

  async getMedia(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async deleteMedia(id: string, deletedById: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete file from MinIO or local storage
    try {
      if (this.minioClient) {
        await this.minioClient.removeObject(this.BUCKET_NAME, `uploads/${media.fileName}`);
        this.logger.log(`Deleted file from MinIO: uploads/${media.fileName}`);
      } else {
        const filePath = path.join(this.UPLOAD_DIR, media.fileName);
        await fs.unlink(filePath);
        this.logger.log(`Deleted file from local storage: ${filePath}`);
      }
    } catch (e) {
      this.logger.error(`Failed to delete file: ${e}`);
    }

    // Delete from database
    return this.prisma.media.delete({
      where: { id },
    });
  }

  async getMediaList(
    page: number = 1,
    limit: number = 20,
    mimeType?: string,
    uploadedById?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (mimeType) where.mimeType = mimeType;
    if (uploadedById) where.uploadedById = uploadedById;

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: {
              id: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data: media, total, page, limit };
  }
}