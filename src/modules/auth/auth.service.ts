import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isMobilePhone } from 'class-validator';
import { Authtype } from './enums/type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../user/entities/profile.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
  ) {}
  userExistence(authDto: AuthDto) {
    const { method, type, username } = authDto;
    switch (type) {
      case Authtype.Login: return this.login(method, username);
      case Authtype.Register: return this.register(method, username);
      default: throw new UnauthorizedException("Gorg...")
    }
  }
  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method,username);
    let user: UserEntity = await this.checkExistUser(method,validUsername)
    if(!user) throw new BadRequestException("salaam")
  }
 async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method,username);
    let user: UserEntity = await this.checkExistUser(method,validUsername)
    if(!user) throw new BadRequestException("salaam")
  }
  async checkExistUser(method: AuthMethod, username: string) {
    let user: UserEntity;
    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username })
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username })
    } else if (method === AuthMethod.UserName) {
      user = await this.userRepository.findOneBy({ user_name:username})
    } else {
      throw new BadRequestException("Gorg11...")
    }
    return user;
  }
    usernameValidator(method: AuthMethod, username: string) {
      switch (method) {
        case AuthMethod.Email: if (isEmail(username)) return username;
          throw new BadRequestException("Sorry.. Email!");
        case AuthMethod.Phone: if (isMobilePhone(username, "fa-IR")) return username;
          throw new BadRequestException("Sorry.. Phone!")
        case AuthMethod.UserName: return username
        default: throw new BadRequestException("Sorry.. Ajebh!")
      }
    }
  }

