import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { AuditModule } from '../audit/audit.module';

@Module({ imports: [AuditModule], controllers: [MediaController], providers: [MediaService], exports: [MediaService] })
export class MediaModule {}
