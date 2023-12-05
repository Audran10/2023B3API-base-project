import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './users.entity';
import { ProjectUsers } from './project-users.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public name!: string;

  @Column()
  public referringEmployeeId!: string;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'referringEmployeeId' })
  public referringEmployee!: User;

  @OneToMany(() => ProjectUsers, (projectsUser) => projectsUser.project)
  public projectsUsers!: ProjectUsers[];
}
