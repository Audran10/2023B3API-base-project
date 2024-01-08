import { Module, ValidationPipe, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "../constants";
import { UsersModule } from "./users.module";
import { Event } from "../models/events.entity";
import { EventsController } from "../routes/events.controller";
import { EventsService } from "../providers/events.service";
import { ProjectUsersModule } from "./project-users.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1d' },
        }),
        UsersModule,
        ProjectUsersModule,
    ],
    controllers: [EventsController],
    providers: [
        EventsService,
        {
            provide: 'APP_PIPE',
            useValue: new ValidationPipe({
              transform: true,
            }),
        },
    ],
    exports: [EventsService],
})
export class EventsModule {}