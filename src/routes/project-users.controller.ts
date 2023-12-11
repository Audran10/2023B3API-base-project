import { Body, Controller, Post, Res, UseGuards, Request, UnauthorizedException, NotFoundException, ConflictException, Get } from "@nestjs/common";
import { ProjectUsersService } from "../providers/project-users.service";
import { Response } from "express";
import { AuthGuard } from '../auth/auth.guard';
import { addUserToProjectDto } from "../dto/project-users/add-user-to-project.dto";
import { UsersService } from "../providers/users.service";
import { ProjectsService } from "../providers/projects.service";

@Controller('project-users')
export class ProjectUsersController {
    constructor(
        private readonly projectsUsersService: ProjectUsersService,
        private readonly usersService: UsersService, 
        private readonly projectsService: ProjectsService
    ) {}

    @UseGuards(AuthGuard)
    @Post('/')
    async adduserToProject(@Body() projectUserData: addUserToProjectDto, @Request() req: any) {
        const userRole = await this.usersService.userRole(req.user.sub);

        if (!await this.projectsService.findById(projectUserData.projectId) || !await this.usersService.findById(projectUserData.userId)) {
            throw new NotFoundException();
        }

        if (await this.projectsUsersService.UserAlreadyInProjectInSameDate(projectUserData.userId, projectUserData.startDate, projectUserData.endDate)) {
            throw new ConflictException();
        }

        if (userRole === 'Admin' || userRole === 'ProjectManager') {
            return this.projectsUsersService.addUserToProject(projectUserData);
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
        return this.projectsUsersService.getMyProjects(req.user.sub);
        
    }

    @UseGuards(AuthGuard)
    @Get('/:id')
    async getProjectUser(@Request() req: any) {
        const userRole = await this.usersService.userRole(req.user.sub);

        if (userRole === 'Admin' || userRole === 'ProjectManager') {
            return this.projectsUsersService.findById(req.params.id);
        }
        return this.projectsUsersService.findById(req.user.sub);
    }

}