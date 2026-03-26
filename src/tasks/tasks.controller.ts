import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService
  ) {}

  @Get()
  async findAll(@Query('projectId') projectId: string, @Request() req: any) {
    if (projectId) {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
         const isAllocated = await this.projectsService.isUserAllocated(projectId, req.user.userId);
         if (!isAllocated) throw new ForbiddenException('Not authorized to view tasks for this project.');
      }
      return this.tasksService.findAllByProject(projectId);
    }
    return this.tasksService.findAll();
  }

  @Get('all')
  async findAllGlobal() {
    return this.tasksService.findAll();
  }

  @Post()
  async create(@Body() taskDto: any, @Request() req: any) {
    return this.tasksService.create(taskDto, req.user.name);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    await this.checkWriteAccess(id, req.user);
    return this.tasksService.updateStatus(id, body.status, req.user.name);
  }

  @Put(':id')
  async updateDetails(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    await this.checkWriteAccess(id, req.user);
    return this.tasksService.updateDetails(id, body, req.user.name);
  }

  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body() body: { text: string }, @Request() req: any) {
    return this.tasksService.addComment(id, req.user.userId, req.user.name, body.text);
  }

  @Put(':id/comments/:commentId')
  async updateComment(@Param('id') id: string, @Param('commentId') commentId: string, @Body() body: { text: string }, @Request() req: any) {
    const task = await this.tasksService.findById(id);
    if (!task) throw new ForbiddenException('Task not found');
    const comment = task.comments.find(c => c._id?.toString() === commentId);
    if (comment && comment.user_id !== req.user.userId && req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
        throw new ForbiddenException('You can only edit your own comments.');
    }
    return this.tasksService.updateComment(id, commentId, req.user.userId, req.user.name, body.text);
  }

  @Delete(':id/comments/:commentId')
  async deleteComment(@Param('id') id: string, @Param('commentId') commentId: string, @Request() req: any) {
    const task = await this.tasksService.findById(id);
    if (!task) throw new ForbiddenException('Task not found');
    const comment = task.comments.find(c => c._id?.toString() === commentId);
    if (comment && comment.user_id !== req.user.userId && req.user.role !== 'ADMIN' && req.user.role !== 'CTO') {
        throw new ForbiddenException('You can only delete your own comments.');
    }
    return this.tasksService.deleteComment(id, commentId, req.user.name);
  }

  private async checkWriteAccess(taskId: string, user: any) {
    if (user.role === 'ADMIN' || user.role === 'CTO') return;
    const task = await this.tasksService.findById(taskId);
    if (!task) throw new ForbiddenException('Task not found');
    if (task.assignee?.toString() !== user.userId) {
      throw new ForbiddenException('Only the assignee, Admin, or CTO can update this task.');
    }
  }
}
