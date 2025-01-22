import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
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
import {
  AuthMessage,
  NotFoundMessage,
  PublicMessage,
} from 'src/common/enums/message.enum';
import { FollowEnity } from './entities/follow.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { PaginationDto } from 'src/common/dtos/pagination..dto';
import {
  paginationGenerator,
  paginationSolver,
} from 'src/common/utils/pagination.util';
import { UserBlockDto } from '../auth/dto/auth.dto';
import { UserStatus } from './enum/status.enum';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @InjectRepository(FollowEnity) private followRepository: Repository<FollowEnity>
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
    let profile = await this.profileRepository.findOneBy({ userId });
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
      profile = this.profileRepository.create({
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
    profile = await this.profileRepository.save(profile);
    if (!profileId) {
      await this.userRepository.update(
        { id: userId },
        { profileId: profile.id }
      );
    }
    return { message: PublicMessage.Updated };
  }
  async find(paginationDto: PaginationDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);
    const [users, count] = await this.userRepository.findAndCount({
      where: {},
      skip,
      take: limit,
    });
    return {
      pagination: paginationGenerator(count, skip, limit),
      users,
    };
  }

  async followers(paginationDto: PaginationDto) {
    const { id: userId } = this.request.user;
    const { page, limit, skip } = paginationSolver(paginationDto);
    const [followers, count] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: {
        follower: {
          profile: true,
        },
      },
      select: {
        id: true,
        follower: {
          id: true,
          username: true,
          profile: {
            id: true,
            nick_name: true,
            bio: true,
            bg_image: true,
          },
        },
      },
      skip,
      take: limit,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      followers,
    };
  }

  async following(paginationDto: PaginationDto) {
    const { id: userId } = this.request.user;
    const { page, limit, skip } = paginationSolver(paginationDto);
    const [follwoing, count] = await this.followRepository.findAndCount({
      where: {
        followerId: userId,
      },
      relations: {
        following: {
          profile: true,
        },
      },
      select: {
        id: true,
        following: {
          id: true,
          username: true,
          profile: {
            id: true,
            nick_name: true,
            bio: true,
            bg_image: true,
            profile_image: true,
          },
        },
      },
      skip,
      take: limit,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      follwoing,
    };
  }
  profile() {
    const { id } = this.request.user;
    return this.userRepository
      .createQueryBuilder(EntityName.User)
      .where({ id })
      .leftJoinAndSelect('user.profile', 'profile')
      .loadRelationCountAndMap('user.followers', 'user.followers')
      .loadRelationCountAndMap('user.following', 'user.following')
      .getOne();
  }

  async changeEmail(email: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ email });
    if (user && user?.id !== id) {
      throw new BadRequestException('pofusss!..');
    } else if (user && user.id == id) {
      return { message: 'Updated Success..' };
    }
    await this.userRepository.update({ id }, { new_email: email });
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
    return { message: 'Updated Success', accessToken };
  }

  async changePhone(phone: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ phone });
    if (user && user?.id !== id) {
      throw new BadRequestException('pofusss!..');
    } else if (user && user.id == id) {
      return { message: 'Updated Success..' };
    }
    await this.userRepository.update({ id }, { new_phone: phone });
    const otp = await this.authService.saveOtp(id, AuthMethod.Phone);
    const token = this.tokenService.createPhoneToken({ phone });
    return {
      code: otp.code,
      token,
    };
  }

  async verifyPhone(code: string) {
    const { id: userId, new_phone } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.PhoneOTp];
    if (!token) throw new BadRequestException('Donbal ch megrdaee?..');
    const { phone } = this.tokenService.verifyPhoneToken(token);
    if (phone !== new_phone) {
      throw new BadRequestException('Phone not match..');
    }
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Phone) {
      throw new BadRequestException('No No No Mobile....');
    }
    await this.userRepository.update(
      { id: userId },
      {
        phone,
        verify_phone: true,
        new_phone: null,
      }
    );
    return { message: 'Updated Success' };
  }

  async changeUsername(username: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ username });
    if (user && user?.id !== id) {
      throw new BadRequestException('pofusss username not mach!..');
    } else if (user && user.id == id) {
      return { message: 'Updated Success..' };
    }
    await this.userRepository.update({ id }, { username });
    return { message: 'Updated Username!..' };
  }

  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new BadRequestException('Shramandeh Boy badimiad...');
    const now = new Date();
    if (otp.expiresIn < now) throw new BadRequestException('Otp BAtel Shod..');
    if (otp.code !== code) throw new BadRequestException('Otp badd..');
    return otp;
  }

  async followToggle(followingId: number) {
    const { id: userId } = this.request.user;
    const follwoing = await this.userRepository.findOneBy({ id: followingId });
    if (!follwoing) throw new BadRequestException(NotFoundMessage.NotFoundUser);
    const isFollowing = await this.followRepository.findOneBy({
      followingId,
      followerId: userId,
    });
    let message = PublicMessage.Followed;
    if (isFollowing) {
      message = PublicMessage.UnFollow;
      await this.followRepository.remove(isFollowing);
    } else {
      await this.followRepository.insert({ followingId, followerId: userId });
    }
    return { message };
  }

  async blockToggle(blockDto: UserBlockDto) {
    const { userId } = blockDto;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException(AuthMessage.NotFoundAccount);
    let message = PublicMessage.Blocked;
    if (user.status === UserStatus.Block) {
      message = PublicMessage.UnBlocked;
      await this.userRepository.update({ id: userId }, { status: null });
    } else {
      await this.userRepository.update(
        { id: userId },
        { status: UserStatus.Block }
      );
    }
    return { message };
  }
}
