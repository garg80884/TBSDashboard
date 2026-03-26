import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().populate('owner').exec();
  }

  async findMyProjects(userId: string): Promise<Project[]> {
    return this.projectModel.find({
      $or: [
        { manager: userId },
        { team_members: userId }
      ]
    }).populate('owner').exec();
  }

  async isUserAllocated(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) return false;
    if (project.manager && project.manager.toString() === userId) return true;
    if (project.team_members && project.team_members.some(id => id.toString() === userId)) return true;
    return false;
  }

  async isUserManager(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) return false;
    return project.manager && project.manager.toString() === userId;
  }

  async create(projectDto: any): Promise<Project> {
    const createdProject = new this.projectModel(projectDto);
    return createdProject.save();
  }
}
