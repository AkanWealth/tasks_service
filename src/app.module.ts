import { Module } from '@nestjs/common';
// import { RedisModule } from 'nestjs-redis';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { CacheModule } from '@nestjs/cache-manager';

import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { AppController } from './app.controller';
// import { RedisCoreModule } from './infrastructure/cache/redis/redis-core.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '235112208',
      database: 'task_management',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    // RedisCoreModule,
    // CacheModule.register(),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
