import { Controller, Get, Post, Body, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';

@Controller('sprints')
@UseGuards(JwtAuthGuard)
export class SprintsController {
  constructor(
    private readonly sprintsService: SprintsService,
    private readonly projectsService: ProjectsService
  ) {}

  @Get()
  async findAll(@Query('projectId') projectId: string, @Request() req: any) {
    if (!projectId) return [];
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
      const isAllocated = await this.projectsService.isUserAllocated(projectId, req.user.userId);
      if (!isAllocated) throw new ForbiddenException('You are not allocated to this project.');
    }
    return this.sprintsService.findAllByProject(projectId);
  }

  @Post()
  async create(@Body() sprintDto: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
      const isManager = await this.projectsService.isUserManager(sprintDto.project_id, req.user.userId);
      if (!isManager) throw new ForbiddenException('Only Admins, CTOs, and Project Managers can create sprints.');
    }
    return this.sprintsService.create(sprintDto);
  }
}
