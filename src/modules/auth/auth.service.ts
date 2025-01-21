import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isMobilePhone } from 'class-validator';
import { Authtype } from './enums/type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../user/entities/profile.entity';
import { OtpEntity } from '../user/entities/otp.entity';
import { randomInt } from 'crypto';
import { TokenService } from './tokens.service';
import { Request, Response } from 'express';
import { AuthResponse } from './types/responce';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { REQUEST } from '@nestjs/core/router/request';
import { CookiesOptionToken } from 'src/common/utils/cooki.util';
import { AuthMessage, PublicMessage } from 'src/common/enums/message.enum';
// import { KavenegarService } from '../http/kevenegar.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService,
    // private kavenegarService: KavenegarService
  ) {}
  async userExistence(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;
    let result: AuthResponse;
    switch (type) {
      case Authtype.Login:
        result = await this.login(method, username);
        await this.sendOtp(method,username,result.code)
        return this.sendResponse(res, result);
      case Authtype.Register:
        result = await this.register(method, username);
        await this.sendOtp(method,username,result.code)
        return this.sendResponse(res, result);
      default:
        throw new UnauthorizedException('Gorg...');
    }
  }
  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity = await this.checkExistUser(method, validUsername);
    if (!user) throw new BadRequestException('Salam!...');
    const otp = await this.saveOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });
    return { code: otp.code, token };
  }
  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity = await this.checkExistUser(method, validUsername);
    if (user) throw new ConflictException('Eshtbah omde..');
    if (method === AuthMethod.UserName) {
      throw new BadRequestException('Nmessheh...');
    }
    user = this.userRepository.create({
      [method]: username,
    });
    user = await this.userRepository.save(user);
    user.username = `BKC_${user.id}`;
    await this.userRepository.save(user);
    const otp = await this.saveOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });
    return {
      token,
      code: otp.code,
    };
  }
  async sendOtp(method: AuthMethod, username: string, code: string) {
    if (method === AuthMethod.Email) {
      //Email
    } else {
      if (method === AuthMethod.Phone) {
        // await this.kavenegarService.sendVerificationSms(username, code);
      }
    }
  }
  async sendResponse(res: Response, result: AuthResponse) {
    const { token, code } = result;
    res.cookie(CookieKeys.OTp, token, CookiesOptionToken());
    res.json({ message: PublicMessage.SentOtp ,code});
  }
  async saveOtp(userId: number, method: AuthMethod) {
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + 1000 * 60 * 2);
    let existotp = false;
    let otp = await this.otpRepository.findOneBy({ userId });
    if (otp) {
      existotp = true;
      otp.code = code;
      otp.expiresIn = expiresIn;
      otp.method = method;
    } else {
      otp = this.otpRepository.create({
        userId,
        code,
        expiresIn,
        method,
      });
    }
    otp = await this.otpRepository.save(otp);
    if (!existotp) {
      await this.userRepository.update(
        { id: userId },
        {
          otpId: otp.id,
        }
      );
    }
    return otp;
  }
  async checkOtp(code: string) {
    const token = this.request.cookies?.[CookieKeys.OTp];
    if (!token) throw new UnauthorizedException('Token Not Found');
    const { userId } = this.tokenService.verifyOtpToken(token);
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException('Otp Not Found');
    const now = new Date();
    if (otp.expiresIn < now) throw new UnauthorizedException('Otp Expired');
    if (otp.code !== code) throw new UnauthorizedException('Cod..Bad');
    const acccessToken = this.tokenService.createAccessToken({ userId });
    if (otp.method === AuthMethod.Email) {
      await this.userRepository.update({ id: userId }, { verify_email: true });
    } else if (otp.method === AuthMethod.Phone) {
      await this.userRepository.update({ id: userId }, { verify_email: true });
    }
    return { message: PublicMessage.LoggedIn, acccessToken };
  }
  async checkExistUser(method: AuthMethod, username: string) {
    let user: UserEntity;
    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username });
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username });
    } else if (method === AuthMethod.UserName) {
      user = await this.userRepository.findOneBy({ username });
    } else {
      throw new BadRequestException('Gorg11...');
    }
    return user;
  }
  async validateAccessToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }

  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException('Sorry.. Email!');
      case AuthMethod.Phone:
        if (isMobilePhone(username, 'fa-IR')) return username;
        throw new BadRequestException('Sorry.. Phone!');
      case AuthMethod.UserName:
        return username;
      default:
        throw new BadRequestException('Sorry.. Ajebh!');
    }
  }
}
