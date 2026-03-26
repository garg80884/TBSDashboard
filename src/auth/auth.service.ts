import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AccountStatus, UserRole } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password_hash)) {
      const isAdmin = email.toLowerCase().includes('admin');
      let status = user.account_status;
      
      // Auto-approve admins if they somehow ended up pending or another role
      if (isAdmin && status !== AccountStatus.ACTIVE) {
        await this.usersService.update(user._id.toString(), { account_status: AccountStatus.ACTIVE, role: UserRole.ADMIN });
        status = AccountStatus.ACTIVE;
        user.role = UserRole.ADMIN;
      }

      if (status !== AccountStatus.ACTIVE) {
        throw new UnauthorizedException('Account is pending approval or blocked.');
      }
      const { password_hash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id || user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(userDto: any) {
    const user = await this.usersService.create(userDto);
    return { message: 'Registration submitted for approval.', userId: user._id };
  }
}
