import { Body, Controller, Post, Res, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { Response, response } from 'express';
import { ProjectsService } from '../providers/projects.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateProjectDto } from '../dto/projects/create-project.dto';
import { UsersService } from '../providers/users.service';

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
}
