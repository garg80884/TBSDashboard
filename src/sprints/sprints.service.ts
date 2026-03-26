import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sprint } from '../schemas/sprint.schema';

@Injectable()
export class SprintsService {
  constructor(@InjectModel(Sprint.name) private sprintModel: Model<Sprint>) {}

  async findAllByProject(projectId: string): Promise<Sprint[]> {
    return this.sprintModel.find({ project_id: projectId })
      .populate('allocated_members', 'name email role')
      .exec();
  }

  async create(sprintDto: any): Promise<Sprint> {
    const createdSprint = new this.sprintModel(sprintDto);
    return createdSprint.save();
  }
}
