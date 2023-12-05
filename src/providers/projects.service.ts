import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../models/projects.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from '../dto/projects/create-project.dto';
import { User } from '../models/users.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) {}

    async createProject(projectData: CreateProjectDto, referringEmployee: User): Promise<Project> {
        if (projectData.name.length >= 3) {
            const newProject = this.projectRepository.create({
                ...projectData,
                referringEmployee,
            });

            return await this.projectRepository.save(newProject);
        }
    }

    async findById(id: string): Promise<Project> {
        return await this.projectRepository.findOne({ where: { id } });
    }
}
