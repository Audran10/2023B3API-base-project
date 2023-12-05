import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Request,
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
  async createUser(
    @Body() UserData: CreateUserDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const existing_user_username = await this.usersService.findByUsername(
        UserData.username,
      );
      const existing_user_email = await this.usersService.findByEmail(
        UserData.email,
      );
      if (existing_user_username) {
        res.status(500).json({ message: 'User already exists' });
        return;
      }
      if (existing_user_email) {
        res.status(500).json({ message: 'User already exists' });
        return;
      }

      const newUser = await this.usersService.createUser(UserData);
      delete newUser.password;
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: 'Unable to create the user', error });
    }
  }

  @Post('auth/login')
  async login(@Body() UserData: LoginDto, @Res() res: Response): Promise<void> {
    return this.usersService.login(UserData.email, UserData.password).then(
      (response) => {
        res.status(201).json(response);
      },
      (error) => {
        res.status(401).json({ message: 'Unable to login', error });
      },
    );
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Request() req, @Res() res: Response) {
    if (req.user) {
      const user = await this.usersService.findById(req.user.sub);
      delete user.password;
      return res.status(200).json(user);
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async getUsers(@Res() res: Response): Promise<void> {
    try {
      const users = await this.usersService.findAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(401).json({ message: 'Unable to get the users', error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserById(@Res() res: Response, @Request() req): Promise<void> {
    try {
      const user = await this.usersService.findById(req.params.id);
      if (user) {
        delete user.password;
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Unable to get the user', error });
    }
  }
}
