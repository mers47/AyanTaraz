import { Module } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({ imports: [AuthModule], controllers: [ConsultationController], providers: [ConsultationService], exports: [ConsultationService] })
export class ConsultationModule {}
