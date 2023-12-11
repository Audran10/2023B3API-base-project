import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./users.entity";

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public date!: Date;

    @Column({
        type: 'enum',
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending',
    })
    public eventStatus?: string;

    @Column({
        type: 'enum',
        enum: ['RemoteWork', 'PaidLeave'],
    })
    public eventType!: string;

    @Column()
    public eventDescription?: string;

    @Column()
    public userId!: string; //au format uuidv4

    @ManyToOne(() => User, (user) => user.projectsUsers)
    @JoinColumn({ name: "userId" })
    public user!: User;
}