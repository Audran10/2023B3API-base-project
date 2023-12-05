import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateUserDto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @IsNotEmpty()
  @Length(3)
  username!: string;

  @IsEmail()
  email!: string;

  @Length(8)
  password!: string;

  role!: 'Employee' | 'Admin' | 'ProjectManager';
}
