import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartAssistantDto {
  @ApiProperty({
    description: 'Initial question ID (optional, starts from first question if not provided)',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  questionId?: string;

  @ApiProperty({
    description: 'User answers so far (for resuming)',
    example: { answer1: 'value1', answer2: 'value2' },
    required: false,
  })
  @IsOptional()
  answers?: Record<string, string>;
}
