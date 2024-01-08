import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/users.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dto/users/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email }, select: ['id', 'username', 'email', 'role', 'password'] });
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async login(email, password) {
    const user = await this.findByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  async userRole(id: string): Promise<string> {
    const user = await this.findById(id);
    return user.role;
  }

  async getMealVouchers(id: string, month: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        events: true,
      },
    });

    const events = user.events.filter((event) => {
      event.date.getMonth() === month && event.eventStatus === 'Accepted';
    });

    const firstDayOfMonth = dayjs().set('month', month-1).startOf('month');
    const lastDayOfMonth = firstDayOfMonth.endOf('month');
    let mealVouchers = 0;

    let currentDate = firstDayOfMonth;
    while (currentDate.isBefore(lastDayOfMonth) || currentDate.isSame(lastDayOfMonth)) {
      if (currentDate.day() >= 1 && currentDate.day() <= 5) {
        mealVouchers ++;
      }
      currentDate = currentDate.add(1, 'day');
    }
    return (mealVouchers - events.length) * 8;
  }
}
