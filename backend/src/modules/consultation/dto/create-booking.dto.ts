import { IsString, IsPhoneNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Service ID', example: 'uuid' })
  @IsString()
  serviceId: string;

  @ApiProperty({ description: 'Slot ID', example: 'uuid' })
  @IsString()
  slotId: string;

  @ApiProperty({ description: 'Phone number for verification', example: '+989123456789' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ description: 'OTP code for verification', example: '123456' })
  @IsString()
  otpCode: string;

  @ApiProperty({ description: 'Additional notes', example: 'Urgent consultation', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
