import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get('my-projects')
  async findMyProjects(@Request() req: any) {
    if (req.user.role === 'ADMIN' || req.user.role === 'CTO') {
      return this.projectsService.findAll();
    }
    return this.projectsService.findMyProjects(req.user.userId);
  }

  @Post()
  async create(@Body() projectDto: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
      throw new UnauthorizedException('Only Admin or CTO can create projects.');
    }
    projectDto.owner = req.user.userId;
    return this.projectsService.create(projectDto);
  }

  // Allocate members
  @Put(':id/members')
  async updateMembers(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
      throw new UnauthorizedException('Unauthorized to allocate members');
    }
    // Pass to service. (Simplified for prototype)
    return { success: true, message: 'Members updated.' };
  }
}
