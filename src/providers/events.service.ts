import {
    Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../models/events.entity';
import { createEventDto } from '../dto/events/create-events.dto';
import { User } from '../models/users.entity';
import * as dayjs from 'dayjs';
import { ProjectUsersService } from './project-users.service';
  
@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly EventsRepository: Repository<Event>,
        private readonly projectUsersService: ProjectUsersService,
    ) {}

    async userCanCreateEvent(userId: string, date: Date) {
        const events = await this.EventsRepository.find({
            where: { 
                userId: userId,
            },
        });

        if (events.length === 0) {
            return true;
        }
        const newEventDate = dayjs(date);

        let count = 0;
        for (const event of events) {
            const existingEventDate = dayjs(event.date);

            if (newEventDate.isSame(existingEventDate, 'day')) {
                return false;
            }

            if (newEventDate.isSame(existingEventDate, 'week') && event.eventType === 'RemoteWork') {
                count++;
            }
        }
        return count < 2;
    }

    async createEvent(eventData: createEventDto, user: User) {
        if (!await this.userCanCreateEvent(user.id, eventData.date)) {
            throw new UnauthorizedException();
        }

        const newEvent = await this.EventsRepository.create({
            ...eventData,
            userId: user.id,
        });
        return this.EventsRepository.save(newEvent);
    }

    async getAllEvents() {
        return this.EventsRepository.find();
    }

    async getEvent(id: string) {
        const event = await this.EventsRepository.findOne({ where: { id } });
        if (!event) {
            throw new UnauthorizedException();
        }
        return event;
    }

    async changeStatusEvent(id: string, status: 'Accepted' | 'Declined', user: User) {
        const event = await this.EventsRepository.findOne({ 
            where: { 
                id: id,
                eventStatus: 'Pending',
            } 
        });
        if (!event) {
            throw new NotFoundException();
        }

        if (user.role === 'Employee') {
            throw new UnauthorizedException();
        }

        if (user.role === 'ProjectManager') {
            const projectsUser = await this.projectUsersService.getMyProjects(user.id);
            for (const projectUser of projectsUser) {
                const startDate = dayjs(projectUser.startDate);
                const endDate = dayjs(projectUser.endDate);
                const eventDate = dayjs(event.date);
                if (eventDate.isAfter(startDate) && eventDate.isBefore(endDate)) {
                    return this.EventsRepository.save({
                        ...event,
                        eventStatus: status,
                    });
                }
            }
            throw new UnauthorizedException();
        }

        const projectsUser = await this.projectUsersService.getMyProjects(user.id);
        for (const projectUser of projectsUser) {
            const startDate = dayjs(projectUser.startDate);
            const endDate = dayjs(projectUser.endDate);
            const eventDate = dayjs(event.date);
            if (eventDate.isAfter(startDate) && eventDate.isBefore(endDate)) {
                return this.EventsRepository.save({
                    ...event,
                    eventStatus: status,
                });
            }
        }
        
        
        return this.EventsRepository.save(event);
    }
}