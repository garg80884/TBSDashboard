import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().populate('assignee').exec();
  }

  async findAllByProject(projectId: string): Promise<Task[]> {
    return this.taskModel.find({ project_id: projectId }).populate('assignee').exec();
  }

  async create(taskDto: any, userStr: string): Promise<Task> {
    const createdTask = new this.taskModel(taskDto);
    createdTask.activity_logs.push({
      user: userStr,
      action: 'Created task',
      date: new Date()
    });
    return createdTask.save();
  }

  async updateStatus(id: string, status: string, userStr: string): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) return null;
    task.status = status as any;
    if (status === 'DONE') {
      task.completion_date = new Date();
    }
    task.activity_logs.push({
      user: userStr,
      action: `Moved to ${status}`,
      date: new Date()
    });
    return task.save();
  }

  async updateDetails(id: string, details: any, userStr: string): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) return null;
    Object.assign(task, details);
    task.activity_logs.push({
      user: userStr,
      action: 'Updated task details and assignments',
      date: new Date()
    });
    return task.save();
  }

  async findById(id: string): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }

  async addComment(id: string, userId: string, userName: string, text: string): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) return null;
    task.comments.push({
      user_name: userName,
      user_id: userId,
      text: text,
      created_at: new Date(),
      updated_at: new Date()
    });
    task.activity_logs.push({
      user: userName,
      action: 'Added a comment',
      date: new Date()
    });
    return task.save();
  }

  async updateComment(id: string, commentId: string, userId: string, userName: string, text: string): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) return null;
    const comment = task.comments.find(c => c._id?.toString() === commentId);
    if (!comment) return null;
    // Note: Assuming authorization is handled in controller
    comment.text = text;
    comment.updated_at = new Date();
    task.activity_logs.push({
      user: userName,
      action: 'Updated a comment',
      date: new Date()
    });
    return task.save();
  }

  async deleteComment(id: string, commentId: string, userName: string): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) return null;
    task.comments = task.comments.filter(c => c._id?.toString() !== commentId);
    task.activity_logs.push({
      user: userName,
      action: 'Deleted a comment',
      date: new Date()
    });
    return task.save();
  }
}
