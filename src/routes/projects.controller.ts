import { Body, Controller, Post, Res, UseGuards, Request, UnauthorizedException, Get, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Response, response } from 'express';
import { ProjectsService } from '../providers/projects.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateProjectDto } from '../dto/projects/create-project.dto';
import { UsersService } from '../providers/users.service';
import { NotFoundError } from 'rxjs';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService, private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post('/')
  async createProject(@Body() ProjectData: CreateProjectDto, @Res() res: Response, @Request() req: any) {
    const userRole = await this.usersService.userRole(req.user.sub);
    const referringEmployee = await this.usersService.findById(ProjectData.referringEmployeeId);
    delete referringEmployee.password;

    if (referringEmployee.role === 'Employee') {
      throw new UnauthorizedException();
    }

    if (userRole === 'Admin') {
      const newProject = await this.projectsService.createProject(ProjectData, referringEmployee);
      const responseData = {
        ...newProject,
        referringEmployee,
        referringEmployeeId: referringEmployee.id,
      }
      res.status(201).json(responseData);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async getAllProjects(@Request() req: any) {
    const userRole = await this.usersService.userRole(req.user.sub);


    if (userRole === 'Admin' || userRole === 'ProjectManager') {
      const projects = await this.projectsService.getAllProjects();
      if (!projects) {
        throw new NotFoundException();
      }
      return projects;
    }
    
    const projects = await this.projectsService.getProjectsByEmployeeId(req.user.sub);
    if (!projects) {
      throw new NotFoundException();
    }
    return projects;
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getProject(@Request() req: any) {
    const userRole = await this.usersService.userRole(req.user.sub);

    if (userRole === 'Admin' || userRole === 'ProjectManager') {
      const project = await this.projectsService.findById(req.params.id);
      if (!project) {
        throw new NotFoundException();
      }
      return project;
    }

    return this.projectsService.getOneProjectByEmployeeId(req.user.sub, req.params.id);
  }
}
