import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('configured-tasks')
  async getConfiguredTasks() {
    console.log('getConfiguredTasks.');
    return this.tasksService.getConfiguredTasks();
  }

  @Get('next-schedule-tasks')
  getNextScheduledTasks() {
    console.log('getNextScheduledTasks.');
    return this.tasksService.getNextScheduledTasks();
  }
}
