import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findAllByStatus(status: string): Promise<User[]> {
    return this.userModel.find({ account_status: status }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateDto: any): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async create(userDto: any): Promise<User> {
    const createdUser = new this.userModel(userDto);
    return createdUser.save();
  }
}
