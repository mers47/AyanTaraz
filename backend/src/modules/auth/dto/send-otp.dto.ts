import { IsPhoneNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOTPDto {
  @ApiProperty({
    description: 'Phone number in international format (e.g., +989123456789)',
    example: '+989123456789',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'Type of OTP (default: PHONE_VERIFICATION)',
    example: 'PHONE_VERIFICATION',
    enum: ['PHONE_VERIFICATION', 'BOOKING_VERIFICATION'],
  })
  @IsOptional()
  type?: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION' = 'PHONE_VERIFICATION';
}
