import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../providers/users.service';
import { CreateUserDto } from '../dto/users/create-user.dto';

import { LoginDto } from '../dto/users/login.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/sign-up')
  async createUser(@Body() UserData: CreateUserDto) {
      const newUser = await this.usersService.createUser(UserData);
      delete newUser.password;
      return newUser;
  }

  @Post('auth/login')
  async login(@Body() UserData: LoginDto) {
    return this.usersService.login(UserData.email, UserData.password)
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Request() req, @Res() res: Response) {
    if (req.user) {
      const user = await this.usersService.findById(req.user.sub);
      return res.status(200).json(user);
    }
    throw new UnauthorizedException();
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async getUsers() {
    return this.usersService.findAllUsers();
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserById(@Res() res: Response, @Request() req): Promise<void> {
    try {
      const user = await this.usersService.findById(req.params.id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Unable to get the user', error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id/meal-vouchers/:month')
  async getMealVouchers(@Request() req): Promise<number> {
    return this.usersService.getMealVouchers(req.params.id, req.params.month);
  }
}
