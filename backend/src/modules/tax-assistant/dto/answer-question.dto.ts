import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({
    description: 'Session ID (from start)',
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Question ID',
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Selected option value',
    example: 'option_value',
  })
  @IsString()
  @IsNotEmpty()
  optionValue: string;
}
