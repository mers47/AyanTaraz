import { normalizeIranPhone } from '../../../common/utils/phone.util';
import { Transform } from 'class-transformer';
import { IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Phone number in international format',
    example: '+989123456789',
  })
  @Transform(({ value }) => normalizeIranPhone(value))
  @IsPhoneNumber('IR')
  phone: string;

  @ApiProperty({
    description: 'OTP code (6 digits)',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  code: string;
}
