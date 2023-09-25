import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>, // private readonly taskRepository: TaskRepository,
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) {}

  async getAllTask(): Promise<Task[]> {
    return this.taskRepository.find();
  }
  async createTask(
    title: string,
    description: string,
    deadline: Date,
    assignedToId: number,
  ): Promise<Task> {
    try {
      const cacheKey = `task_${title}_${description}_${deadline}`;
      const cachedTask = await this.redisService.get<Task>(cacheKey);

      if (cachedTask) {
        return cachedTask;
      }
      if (!assignedToId) {
        throw new Error('AssignedToId is required.');
      }

      const userResponse = await this.httpService
        .get(`http://localhost:4001/users/${assignedToId}`)
        .pipe(
          catchError(() => {
            throw new NotFoundException(
              `User with ID ${assignedToId} not found.`,
            );
          }),
          map((response) => response.data),
        )
        .toPromise();

      const task: Task = {
        title,
        description,
        deadline: new Date(deadline),
        assignedToId: userResponse.id, // Access 'id' property from the user response
      };

      // Save the task to the database
      const savedTask = await this.taskRepository.save(task);

      // Cache the newly created task
      await this.redisService.set(cacheKey, savedTask, 3600); // Cache for 1 hour

      return savedTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new InternalServerErrorException(
        'Failed to create task.',
        error.message,
      );
    }
  }

  async getTaskById(id: number): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({ where: { id } });

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found.`);
      }

      return task;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch task.',
        error.message,
      );
    }
  }
}
