import { ApiPropertyOptional } from '@nestjs/swagger';
// import { IsEnum, Length } from 'class-validator/types/decorator/decorators';
import { Gender } from '../enum/gender.enum';
import { IsEnum, Length } from 'class-validator';

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
  @ApiPropertyOptional({ nullable: true,})
  birthday: Date;
  @ApiPropertyOptional({ nullable: true })
  instagram: string;
}
