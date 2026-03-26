import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from '../schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    const isAdminRegistration = body.email.toLowerCase().includes('admin');

    const userDto = {
      name: body.name,
      email: body.email,
      password_hash: await bcrypt.hash(body.password, 10),
      role: isAdminRegistration ? 'ADMIN' : 'DEV',
      account_status: isAdminRegistration ? AccountStatus.ACTIVE : AccountStatus.PENDING,
      allocated_projects: []
    };
    return this.authService.register(userDto);
  }
}
