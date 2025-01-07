import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { OtpEntity } from './otp.entity';

@Entity(EntityName.Profile)
export class ProfileEntity extends BaseEntity {
  @Column()
  nick_name: string;
  @Column({ nullable: true })
  bio: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ nullable: true })
  bg_image: string;
  @Column({ nullable: true })
  profile_image: string;
  @Column({ nullable: true })
  birthday: Date;
  
}
