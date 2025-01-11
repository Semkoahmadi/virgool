import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { OtpEntity } from './otp.entity';
import { ProfileEntity } from './profile.entity';

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;
  @Column({ nullable: true })
  passwrd: string;
  @Column({ nullable: true })
  otpId: number;
  @Column({ nullable: true })
  profileId: number;
  @OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
  @JoinColumn()
  otp: OtpEntity;
  @OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
  @JoinColumn()
  profile: ProfileEntity;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  phone: string;
  @CreateDateColumn()
  creatde_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
