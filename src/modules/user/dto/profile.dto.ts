import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { IsEnum, Length } from 'class-validator/types/decorator/decorators';
import { Gender } from '../enum/gender.enum';
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsString,
  Length,
} from 'class-validator';

export class ProfileDto {
  @ApiPropertyOptional()
  @Length(3, 30)
  nick_name: string;
  @ApiPropertyOptional({ nullable: true })
  @Length(15, 200)
  bio: string;
  @ApiPropertyOptional({ nullable: true, enum: Gender })
  @IsEnum(Gender)
  gender: string;
  @ApiPropertyOptional({ nullable: true, format: 'binary' })
  profile_image: string;
  @ApiPropertyOptional({ nullable: true, format: 'binary' })
  bg_image: string;
  @ApiPropertyOptional({ nullable: true })
  birthday: Date;
  @ApiPropertyOptional({ nullable: true })
  instagram: string;
}

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Sorry Bad Emaill' })
  email: string;
}

export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone('fa-IR', {}, { message: 'Sorry Bad Phone' })
  phone: string;
}

export class ChangeUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(5, 40)
  username: string;
}
