import { Body, Controller, Post, UseGuards, Request, Get } from "@nestjs/common";
import { EventsService } from "../providers/events.service";
import { AuthGuard } from "../auth/auth.guard";
import { createEventDto } from "../dto/events/create-events.dto";
import { UsersService } from "../providers/users.service";

@Controller('events')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly usersService: UsersService,
    ) {}

    @UseGuards(AuthGuard)
    @Post('/')
    async createEvent(@Body() eventData: createEventDto, @Request() req: any) {
        const user = await this.usersService.findById(req.user.sub);
        return this.eventsService.createEvent(eventData, user);
    }

    @UseGuards(AuthGuard)
    @Post('/:id/validate')
    async validateEvent(@Request() req: any) {
        const user = await this.usersService.findById(req.user.sub);
        return this.eventsService.changeStatusEvent(req.params.id, 'Accepted', user);
    }

    @UseGuards(AuthGuard)
    @Get('/')
    async getAllEvents() {
        return this.eventsService.getAllEvents();
    }

    @UseGuards(AuthGuard)
    @Get('/:id')
    async getEvent(@Request() req: any) {
        return this.eventsService.getEvent(req.params.id);
    }
}