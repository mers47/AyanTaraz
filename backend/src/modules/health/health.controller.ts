import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    @Inject('PRISMA_SERVICE') private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ayan-taraz-backend',
      version: '1.0.0',
    };
  }

  @Get('db')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  async dbHealthCheck() {
    try {
      // Execute a simple query to verify database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        database: 'postgresql',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Database connection failed');
    }
  }
}