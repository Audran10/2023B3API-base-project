import {
  ConflictException,
  Injectable,
  NotFoundException,
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
    private readonly projectService: ProjectsService,
    private readonly UsersService: UsersService,
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
    await this.projectUsersRepository.save(newProjectUser);

    const user = await this.UsersService.findById(newProjectUser.userId);
    delete user.password;

    const project = await this.projectService.findById(newProjectUser.projectId)
    const referringEmployee = await this.UsersService.findById(project.referringEmployeeId);
    delete referringEmployee.password;

    const data = {
      id: newProjectUser.id,
      startDate: newProjectUser.startDate,
      endDate: newProjectUser.endDate,
      userId: newProjectUser.userId,
      user: user,
      projectId: newProjectUser.projectId,
      project: {
        id: project.id,
        name: project.name,
        referringEmployeeId: project.referringEmployeeId,
        referringEmployee: referringEmployee,
      },
    };
    return data;
  }

  async getProjectUsers() {
    const responseData = [];
    const projectUsers = await this.projectUsersRepository.find();
    for (const projectUser of projectUsers) {
      const projectData = await this.projectService.findById(projectUser.projectId)

      const data = {
        id: projectUser.id,
        name: projectData.name,
        referringEmployeeId: projectData.referringEmployeeId,
      };
      responseData.push(data);
    }
    return responseData;
  }

  async getMyProjects(userId: string) {
    const responseData = [];
    const projectUsers = await this.projectUsersRepository.find({
      where: { userId: userId },
    });
    for (const projectUser of projectUsers) {
      const projectData = await this.projectService.findById(projectUser.projectId)

      const data = {
        id: projectUser.id,
        name: projectData.name,
        referringEmployeeId: projectData.referringEmployeeId,
      };
      responseData.push(data);
    }
    return responseData;
  }

  async findById(id: string) {
    const projectUser = await this.projectUsersRepository.findOne({ where: { id: id } });
    if (!projectUser) {
      throw new NotFoundException();
    }
    return projectUser;
  }
}
