import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole, AccountStatus } from './schemas/user.schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Seed initial Admin user for prototype testing
  const usersService = app.get(UsersService);
  const existingAdmin = await usersService.findByEmail('admin@mgmt.com');
  if (!existingAdmin) {
    await usersService.create({
      name: 'System Admin',
      email: 'admin@mgmt.com',
      password: 'test', // Service expects password, but we hash it manually since create expects DTO. Wait, the controller hashes it. We should hash here or use the service.
      password_hash: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      account_status: AccountStatus.ACTIVE,
      allocated_projects: []
    });
    console.log('Seed: Admin user created (admin@mgmt.com / admin123) lol');
  }
  const port = process.env.PORT || 8080;
  console.log(`Server is running on port ${port}`);
  await app.listen(port,'0.0.0.0');
}
bootstrap();
