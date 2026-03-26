import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SprintStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Sprint extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project_id: Types.ObjectId;

  @Prop()
  start_date: Date;

  @Prop()
  expected_end_date: Date;

  @Prop({ enum: SprintStatus, default: SprintStatus.PLANNED })
  status: SprintStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  allocated_members: Types.ObjectId[];
}

export const SprintSchema = SchemaFactory.createForClass(Sprint);
