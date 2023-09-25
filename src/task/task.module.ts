import { Task } from './task.entity';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { RedisModule } from 'src/redis/redis.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ClientsModule.register([
      {
        name: 'TASK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://kwtgacis:ou_O6bpIjUrfLjvvzTyvrrpC2JrU0lVZ@gerbil.rmq.cloudamqp.com/kwtgacis',
          ],
          queue: 'user_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    RedisModule,
    HttpModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
