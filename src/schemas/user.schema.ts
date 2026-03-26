import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  CTO = 'CTO',
  PM = 'PM',
  TECH_LEAD = 'TECH_LEAD',
  DEV = 'DEV',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.DEV })
  role: UserRole;

  @Prop({ required: true, enum: AccountStatus, default: AccountStatus.PENDING })
  account_status: AccountStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] })
  allocated_projects: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
