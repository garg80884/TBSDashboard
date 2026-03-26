import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Sprint' })
  sprint_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee: Types.ObjectId;

  @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop()
  start_date: Date;

  @Prop()
  expected_date: Date;

  @Prop()
  completion_date: Date;

  @Prop({ type: [{ user: String, action: String, date: Date }], default: [] })
  activity_logs: { user: string; action: string; date: Date }[];

  @Prop({ 
    type: [{ 
      _id: { type: Types.ObjectId, auto: true },
      user_name: String, 
      user_id: String,
      text: String, 
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    }], 
    default: [] 
  })
  comments: { _id?: Types.ObjectId; user_name: string; user_id: string; text: string; created_at?: Date; updated_at?: Date }[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
