import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'All sessions (default: false)',
    example: false,
  })
  @IsOptional()
  allSessions?: boolean = false;
}
