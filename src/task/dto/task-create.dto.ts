import { IsNotEmpty, IsString, IsDate, IsNumber } from 'class-validator';

export class TaskCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDate()
  deadline: Date;

  @IsNotEmpty()
  @IsNumber()
  assignedToId: number;
}
