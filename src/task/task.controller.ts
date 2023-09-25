// import { Controller, Get } from '@nestjs/common';
// import { TaskService } from './task.service';
// import { Task } from './task.entity';

// @Controller('tasks')
// export class TaskController {
//   constructor(private taskService: TaskService) {}

//   @Get()
//   findAll(): Promise<Task[]> {
//     return this.taskService.findAll();
//   }
// }
// src/application/task/task.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  HttpException,
  Param,
  NotFoundException,
  // HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { ClientProxy } from '@nestjs/microservices';
import { TaskCreateDto } from './dto/task-create.dto';
import { Task } from './task.entity';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    @Inject('TASK_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  getAllTask() {
    this.client.emit('task_retrieved', 'hello from RabbitMQ');
    return this.taskService.getAllTask();
  }

  @Post()
  async createTask(@Body() createTaskDto: TaskCreateDto): Promise<Task> {
    try {
      const task = await this.taskService.createTask(
        createTaskDto.title,
        createTaskDto.description,
        createTaskDto.deadline,
        createTaskDto.assignedToId,
      );
      this.client.emit('task_created', task);
      return task;
    } catch (error) {
      throw new HttpException(
        'Failed to create task.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get(':id')
  async getTaskById(@Param('id') id: number): Promise<Task> {
    try {
      const task = await this.taskService.getTaskById(id);
      this.client.emit('task_retrieved_single', task);
      return task;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        console.log('error', error);
        throw new HttpException(
          'Failed to fetch task.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  // Implement other task-related endpoints, such as updating and deleting tasks
}
