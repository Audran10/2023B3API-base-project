import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "./projects.entity";
import { User } from "./users.entity";

@Entity()
export class ProjectUsers {
    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public startDate!: Date;

    @Column()
    public endDate!: Date;

    @Column()
    public projectId!: string;

    @Column()
    public userId!: string;

    @ManyToOne(() => Project, (project) => project.projectsUsers)
    @JoinColumn({ name: "projectId" })
    public project!: Project;

    @ManyToOne(() => User, (user) => user.projectsUsers)
    @JoinColumn({ name: "userId" })
    public user!: User;
}