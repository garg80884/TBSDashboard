import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller';
import { SprintsService } from './sprints.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Sprint, SprintSchema } from '../schemas/sprint.schema';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sprint.name, schema: SprintSchema }]), ProjectsModule],
  controllers: [SprintsController],
  providers: [SprintsService]
})
export class SprintsModule {}
