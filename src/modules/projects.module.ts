import { Module, ValidationPipe, forwardRef } from '@nestjs/common';
import { ProjectsController } from '../routes/projects.controller';
import { ProjectsService } from '../providers/projects.service';
import { Project } from '../models/projects.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { UsersModule } from './users.module';
import { ProjectUsersModule } from './project-users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
  }),
    UsersModule,
    ProjectUsersModule
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
