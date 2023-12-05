import { IsNotEmpty, IsUUID } from "class-validator";

export class addUserToProjectDto {

    @IsNotEmpty()
    startDate!: Date;

    @IsNotEmpty()
    endDate!: Date;

    @IsNotEmpty()
    @IsUUID("4")
    projectId!: string;

    @IsNotEmpty()
    @IsUUID("4")
    userId!: string;
}