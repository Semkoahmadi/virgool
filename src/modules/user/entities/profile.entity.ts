import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { OtpEntity } from './otp.entity';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, isEmail, IsMobilePhone } from 'class-validator';

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
  @Column({ nullable: true })
  instagram: string;
  @Column()
  userId: number;
  @OneToOne(() => UserEntity, (user) => user.profile, { onDelete: 'CASCADE' })
  user: UserEntity;
}

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Sorry Bad Emaill' })
  email: string;
}

export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone('fa-IR', {}, { message: 'Sorry Bad Phone' })
  email: string;
}
