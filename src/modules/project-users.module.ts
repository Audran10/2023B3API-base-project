import { Module, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectUsers } from "../models/project-users.entity";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "../constants";
import { ProjectUsersController } from "../routes/project-users.controller";
import { ProjectUsersService } from "../providers/project-users.service";
import { UsersModule } from "./users.module";
import { ProjectsModule } from "./projects.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([ProjectUsers]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1d' },
        }),
        UsersModule,
        ProjectsModule,
    ],
    controllers: [ProjectUsersController],
    providers: [
        ProjectUsersService,
        {
            provide: 'APP_PIPE',
            useValue: new ValidationPipe({
              transform: true,
            }),
        },
    ],
})
export class ProjectUsersModule {}