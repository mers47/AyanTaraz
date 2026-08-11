import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.media.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.media.count(),
    ]);
    return { data, total, page, limit };
  }

  async getById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('رسانه یافت نشد');
    return media;
  }

  async upload(
    file: { name: string; fileName: string; fileBase64: string; mimeType?: string; altText?: string; dimensions?: string; description?: string },
    uploadedById: string,
    auditIp?: string,
  ) {
    if (!file.fileBase64 || !file.fileName) {
      throw new BadRequestException('fileBase64 و fileName الزامی هستند');
    }

    // Extract the actual base64 data (strip data URI prefix if present)
    const base64Data = file.fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (~10MB max)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('حجم فایل بیش از حد مجاز است (حداکثر ۱۰ مگابایت)');
    }

    // Validate file extension
    const ext = path.extname(file.fileName).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.svg'];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException('فرمت فایل مجاز نیست');
    }

    // Determine MIME type
    const mimeType = file.mimeType || this.getMimeType(ext);

    // Generate unique filename
    const safeName = `media_${Date.now()}_${file.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, safeName);

    // Use async write
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeName}`;
    const media = await this.prisma.media.create({
      data: {
        name: file.name || file.fileName,
        fileName: safeName,
        fileUrl,
        fileSize: buffer.length,
        mimeType,
        dimensions: file.dimensions || null,
        altText: file.altText || null,
        description: file.description || null,
        uploadedById,
      },
    });

    if (uploadedById) await this.audit.log(uploadedById, 'CREATE', 'Media', media.id, null, { name: file.name, fileName: safeName }, auditIp);
    return media;
  }

  async delete(id: string, auditUserId?: string, auditIp?: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('رسانه یافت نشد');

    // Delete the physical file from disk
    const filePath = path.join(process.cwd(), media.fileUrl);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      // File may already be missing — log but don't fail the DB delete
      console.warn(`Media file not found on disk: ${filePath}`);
    }

    await this.prisma.media.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'Media', id, null, null, auditIp);
    return { success: true };
  }

  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
