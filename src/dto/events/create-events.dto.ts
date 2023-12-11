import { IsNotEmpty } from "class-validator";

export class createEventDto {
    @IsNotEmpty()
    date!: Date;

    eventDescription?: string;

    @IsNotEmpty()
    eventType!: 'RemoteWork' | 'PaidLeave';
}