import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import { ProfileDto } from './dto/profile.dto';
import { Request } from 'express';
import { Gender } from './enum/gender.enum';
import { isDate } from 'class-validator';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepositort: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepositort: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request
  ) {}
  async changeProfile(files: any, profileDto: ProfileDto) {
    if(files?.profile_image?.length > 0){
      let [image] = files?.profile_image;
      profileDto.profile_image = image.path
    }
    if(files?.bg_image?.length > 0){
      let [image] = files?.bg_image;
      profileDto.bg_image = image.path
    }
    const { id: userId, profileId } = this.request.user;
    let profile = await this.profileRepositort.findOneBy({ userId });
    const {
      nick_name,
      bio,
      gender,
      birthday,
      bg_image,
      profile_image,
      instagram,
    } = profileDto;
    if (profile) {
      if (nick_name) profile.nick_name = nick_name;
      if (bio) profile.bio = bio;
      if (gender && Object.values(Gender as any).includes(gender))
        profile.gender = gender;
      if (birthday && isDate(new Date(birthday)))
        profile.birthday = new Date(birthday);
      if (profile_image) profile.profile_image = profile_image;
      if (bg_image) profile.bg_image = bg_image;
      if (instagram) profile.instagram = instagram;
    } else {
      profile = this.profileRepositort.create({
        nick_name,
        bio,
        gender,
        birthday,
        bg_image,
        profile_image,
        instagram,
        userId,
      });
    }
    profile = await this.profileRepositort.save(profile);
    if (!profileId) {
      await this.userRepositort.update(
        { id: userId },
        { profileId: profile.id }
      );
    }
  }

  findAll() {
    return `This action returns all user`;
  }
}
