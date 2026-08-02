import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';
import { TaxModule } from './modules/tax/tax.module';
import { TaxAssistantModule } from './modules/tax-assistant/tax-assistant.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { SeoModule } from './modules/seo/seo.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    // Configuration module (loads .env variables)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Database
    PrismaModule,
    // Cache
    RedisModule,
    // Business modules
    AuthModule,
    UsersModule,
    ContentModule,
    MediaModule,
    TaxModule,
    TaxAssistantModule,
    ConsultationModule,
    SeoModule,
    AdminModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
