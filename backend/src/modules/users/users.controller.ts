import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get(':id') async get(@Param('id') id: string) { return this.svc.findById(id); }
  @Patch(':id') async update(@Param('id') id: string, @Body() d: any) { return this.svc.update(id, d); }
}
