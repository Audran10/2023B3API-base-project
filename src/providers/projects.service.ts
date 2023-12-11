import { Injectable, NotFoundException, forwardRef, Inject, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../models/projects.entity';
import { In, Repository } from 'typeorm';
import { CreateProjectDto } from '../dto/projects/create-project.dto';
import { User } from '../models/users.entity';
import { ProjectUsersService } from './project-users.service';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        private projectUsersService: ProjectUsersService,
    ) {}

    async createProject(projectData: CreateProjectDto, referringEmployee: User): Promise<Project> {
        if (projectData.name.length >= 3) {
            const newProject = this.projectRepository.create({
                ...projectData,
                referringEmployee,
            });

            return this.projectRepository.save(newProject);
        }
    }

    async findById(id: string): Promise<Project> {
        return this.projectRepository.findOne({ where: { id } });
    }

    async getAllProjects() {
        const projects = await this.projectRepository.find({
            relations: {
                referringEmployee: true,
            },
        });
        projects.forEach((project) => {
            delete project.referringEmployee.password;
        });
        return projects;
    }

    async getProjectsByEmployeeId(employeeId: string){
        const projectsUsers = (await this.projectUsersService.getProjectUsers()).filter((projectUser) => {
            return projectUser.userId === employeeId;
        });
        const projectIds = projectsUsers.map((projectUser) => projectUser.projectId);

        const projects = await this.projectRepository.find({
            where: {
                id: In(projectIds),
            },
            relations: {
                referringEmployee: true,
            },
        });

        return projects;
    }

    async getOneProjectByEmployeeId(employeeId: string, projectId: string){
        const project = await this.findById(projectId);
        if (!project) {
            throw new NotFoundException();
        }

        const projectsUsers = (await this.projectUsersService.getProjectUsers()).filter((projectUser) => {
            return projectUser.userId === employeeId && projectUser.projectId === projectId;
        });
        if (projectsUsers.length === 0) {
            throw new ForbiddenException();
        }
        return project;
    }
}
