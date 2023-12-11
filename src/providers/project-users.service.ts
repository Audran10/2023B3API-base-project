import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectUsers } from '../models/project-users.entity';
import { addUserToProjectDto } from '../dto/project-users/add-user-to-project.dto';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { ProjectsService } from './projects.service';
import { UsersService } from './users.service';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUsers)
    private readonly projectUsersRepository: Repository<ProjectUsers>,
  ) {}

  async UserAlreadyInProjectInSameDate(userId: string, startDate: Date, endDate: Date) {
    const projectUsers = await this.projectUsersRepository.find({
        where: { userId: userId },
    });
    
    if (projectUsers.length === 0) {
        return false;
    }

    const newProjectStart = dayjs(startDate);
    const newProjectEnd = dayjs(endDate);

    for (const project of projectUsers) {
        const existingProjectStart = dayjs(project.startDate);
        const existingProjectEnd = dayjs(project.endDate);

        const isStartDateConflict = newProjectStart.isAfter(existingProjectStart) && newProjectStart.isBefore(existingProjectEnd);
        const isEndDateConflict = newProjectEnd.isAfter(existingProjectStart) && newProjectEnd.isBefore(existingProjectEnd);
        const isOverlapping = newProjectStart.isBefore(existingProjectEnd) && newProjectEnd.isAfter(existingProjectStart);

        if (isStartDateConflict || isEndDateConflict || isOverlapping) {
            return true;
        }
    }
    return false;
  }

  async addUserToProject(projectUserData: addUserToProjectDto) {
    const newProjectUser = this.projectUsersRepository.create(projectUserData);
    const savedPU = await this.projectUsersRepository.save(newProjectUser);
    return this.projectUsersRepository.findOne({
      where: { id: savedPU.id },
      relations: {
        project: {
          referringEmployee: true,
        },
        user: true,
      },
    });
  }

  async getProjectUsers() {
    return this.projectUsersRepository.find();
  }

  async getMyProjects(userId: string) {
    return this.projectUsersRepository.find({
      where: { userId: userId },
    });
  }

  async findById(id: string) {
    const projectUser = await this.projectUsersRepository.findOne({ where: { id: id } });
    if (!projectUser) {
      throw new NotFoundException();
    }
    return projectUser;
  }
}
