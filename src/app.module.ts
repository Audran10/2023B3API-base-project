import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { UsersModule } from './modules/users.module';
import { User } from './models/users.entity';
import { ProjectsModule } from './modules/projects.module';
import { ProjectUsersModule } from './modules/project-users.module';
import { Project } from './models/projects.entity';
import { ProjectUsers } from './models/project-users.entity';
import { Event } from './models/events.entity';
import { EventsModule } from './modules/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Project, ProjectUsers, Event],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProjectsModule,
    ProjectUsersModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
