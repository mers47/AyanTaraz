import { IsPhoneNumber, IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOTPDto {
  @ApiProperty({
    description: 'Phone number in international format',
    example: '+989123456789',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'OTP code (6 digits)',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description: 'Type of OTP',
    example: 'PHONE_VERIFICATION',
    enum: ['PHONE_VERIFICATION', 'BOOKING_VERIFICATION'],
  })
  @IsOptional()
  type?: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION' = 'PHONE_VERIFICATION';
}
