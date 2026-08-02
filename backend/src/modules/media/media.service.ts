import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: any,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  private readonly ALLOWED_TYPES = this.configService
    .get<string>('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/webp,application/pdf,video/mp4')
    .split(',')
    .map((t) => t.trim());
  private readonly MAX_FILE_SIZE = this.configService.get<number>('MAX_FILE_SIZE', 5242880); // 5MB

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
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    // Save file
    await this.ensureUploadDir();
    await fs.writeFile(filePath, file.buffer);

    // Get file dimensions for images
    let dimensions: string | null = null;
    if (file.mimetype.startsWith('image/')) {
      // In production, use a library like 'sharp' to get dimensions
      dimensions = '0x0'; // Placeholder
    }

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        name: file.originalname,
        fileName,
        fileUrl: `/uploads/${fileName}`,
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

    // Delete file from filesystem
    try {
      const filePath = path.join(this.UPLOAD_DIR, media.fileName);
      await fs.unlink(filePath);
    } catch (e) {
      // File might not exist, but we still want to delete the record
      console.error(`Failed to delete file: ${e}`);
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
