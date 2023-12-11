import { Body, Controller, Post, Res, UseGuards, Request, UnauthorizedException, NotFoundException, ConflictException, Get } from "@nestjs/common";
import { ProjectUsersService } from "../providers/project-users.service";
import { Response } from "express";
import { AuthGuard } from '../auth/auth.guard';
import { addUserToProjectDto } from "../dto/project-users/add-user-to-project.dto";
import { UsersService } from "../providers/users.service";
import { ProjectsService } from "../providers/projects.service";

@Controller('project-users')
export class ProjectUsersController {
    constructor(private readonly projectsUsersService: ProjectUsersService, private readonly usersService: UsersService, private readonly projectsService: ProjectsService) {}

    @UseGuards(AuthGuard)
    @Post('/')
    async adduserToProject(@Body() projectUserData: addUserToProjectDto, @Res() res: Response, @Request() req: any) {
        const userRole = await this.usersService.userRole(req.user.sub);

        if (!await this.projectsService.findById(projectUserData.projectId) || !await this.usersService.findById(projectUserData.userId)) {
            throw new NotFoundException();
        }

        if (await this.projectsUsersService.UserAlreadyInProjectInSameDate(projectUserData.userId, projectUserData.startDate, projectUserData.endDate)) {
            throw new ConflictException();
        }

        if (userRole === 'Admin' || userRole === 'ProjectManager') {
            const newProjectUser = await this.projectsUsersService.addUserToProject(projectUserData);
            res.status(201).json(newProjectUser);
        } else {
            throw new UnauthorizedException();
        }
    }

    @UseGuards(AuthGuard)
    @Get('/')
    async getProjectUsers(@Request() req: any) {
        const userRole = await this.usersService.userRole(req.user.sub);
        if (userRole === 'Admin' || userRole === 'ProjectManager') {
            return this.projectsUsersService.getProjectUsers();
        } 
        console.log("ID: ", req.user.sub);
        return this.projectsUsersService.getMyProjects(req.user.sub);
        
    }

    @UseGuards(AuthGuard)
    @Get('/:id')
    async getProjectUser(@Res() res: Response, @Request() req: any) {
        const userRole = await this.usersService.userRole(req.user.sub);

        if (userRole === 'Admin' || userRole === 'ProjectManager') {
            const projectUser = await this.projectsUsersService.findById(req.params.id);
            res.status(200).json(projectUser);
        } else if (userRole === 'Employee') {
            const projectUser = await this.projectsUsersService.findById(req.user.sub);
            res.status(200).json(projectUser);
        }
    }

}