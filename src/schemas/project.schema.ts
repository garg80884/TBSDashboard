import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ProjectStatus, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId; // CTO or Admin

  @Prop({ type: Types.ObjectId, ref: 'User' })
  manager: Types.ObjectId; // PM

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  team_members: Types.ObjectId[]; // Tech Leads & Devs
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
