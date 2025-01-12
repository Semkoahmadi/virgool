import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, CookiePayload, EmailTokenPayload, PhoneTokenPayload } from './types/payload';
@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  createOtpToken(payload: CookiePayload) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.OTP_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
    return token;
  }
  verifyOtpToken(token: string): CookiePayload {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.OTP_TOKEN_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Waaw , invalid token!!');
    }
  }

  createAccessToken(payload: AccessTokenPayload) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: "1y"
    });
    return token;
  }
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Waaw , Dozdd!!');
    }
  }

  createEmailToken(payload: EmailTokenPayload) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.EMAIL_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
    return token;
  }
  verifyEmailToken(token: string): EmailTokenPayload {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.EMAIL_TOKEN_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Waaw , Dozdd!!');
    }
  }

  createPhoneToken(payload: PhoneTokenPayload) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.PHONE_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
    return token;
  }
  verifyPhoneToken(token: string): PhoneTokenPayload {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.PHONE_TOKEN_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Waaw , Dozdd!!');
    }
  }
}

