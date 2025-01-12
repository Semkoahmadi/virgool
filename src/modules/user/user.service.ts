import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Code, Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import { ProfileDto } from './dto/profile.dto';
import { Request } from 'express';
import { Gender } from './enum/gender.enum';
import { isDate } from 'class-validator';
import { ProfileImage } from './types/files';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/tokens.service';
import { OtpEntity } from './entities/otp.entity';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { AuthMethod } from '../auth/enums/method.enum';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepositort: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService,
    @InjectRepository(OtpEntity) private otpRepositort: Repository<OtpEntity>
  ) {}
  async changeProfile(files: ProfileImage, profileDto: ProfileDto) {
    if (files?.profile_image?.length > 0) {
      let [image] = files?.profile_image;
      profileDto.profile_image = image?.path?.slice(7);
    }
    if (files?.bg_image?.length > 0) {
      let [image] = files?.bg_image;
      profileDto.bg_image = image?.path?.slice(7);
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
      if (birthday && isDate(new Date(birthday)))
        profile.birthday = new Date(birthday);
      if (gender && Object.values(Gender as any).includes(gender))
        profile.gender = gender;
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
      await this.userRepository.update(
        { id: userId },
        { profileId: profile.id }
      );
    }
    return { message: 'ByBy updated..' };
  }

  profile() {
    const { id } = this.request.user;
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async changeEmail(email: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ email });
    if (user && user?.id !== id) {
      throw new BadRequestException('pofusss!..');
    } else if (user && user.id == id) {
      return { message: 'Updated Success..' };
    }
    await this.userRepository.update({id},{new_email:email})
    const otp = await this.authService.saveOtp(id, AuthMethod.Email);
    const token = this.tokenService.createEmailToken({ email });
    return {
      code: otp.code,
      token,
    };
  }

  async verifyEmail(code: string) {
    const { id: userId, new_email } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.EmailOtp];
    if (!token) throw new BadRequestException('Donbal ch megrdaee?..');
    const { email } = this.tokenService.verifyEmailToken(token);
    if (email !== new_email) {
      throw new BadRequestException('Email not match..');
    }
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Email) {
      throw new BadRequestException('No No No....');
    }
    const accessToken = this.tokenService.createAccessToken({ userId });
    await this.userRepository.update(
      { id: userId },
      {
        email,
        verify_email: true,
        new_email: null,
      }
    );
    return {message:"Updated Success",accessToken}
  }
  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepositort.findOneBy({ userId });
    if (!otp) throw new BadRequestException('Shramandeh Boy badimiad...');
    const now = new Date();
    if (otp.expiresIn < now) throw new BadRequestException('Otp BAtel Shod..');
    if (otp.code !== code) throw new BadRequestException('Otp badd..');
    return otp;
  }
}
