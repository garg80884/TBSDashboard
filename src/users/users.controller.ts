import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from '../schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('pending')
  async findPending(@Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
      throw new UnauthorizedException('Only Admin and CTO can view pending requests.');
    }
    return this.usersService.findAllByStatus(AccountStatus.PENDING);
  }

  @Post()
  async create(@Body() userDto: any) {
    if (userDto.password) {
      userDto.password_hash = await bcrypt.hash(userDto.password, 10);
      delete userDto.password;
    }
    return this.usersService.create(userDto);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
      throw new UnauthorizedException('Unauthorized to change status');
    }
    // Admins can change anyone. CTOs cannot change Admins.
    return this.usersService.update(id, body);
  }
}
