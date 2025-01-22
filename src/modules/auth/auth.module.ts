import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './tokens.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ProfileEntity } from '../user/entities/profile.entity';
import { OtpEntity } from '../user/entities/otp.entity'
import { GoogleStrategy } from './strategy/google.strategy';
import { GoogleAuthController } from './gogle,controller';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OtpEntity, ProfileEntity])],
  controllers: [AuthController,GoogleAuthController],
  providers: [AuthService,JwtService ,TokenService ,GoogleStrategy],
  exports:[AuthService, TokenService, JwtService,TypeOrmModule,GoogleStrategy]
})
export class AuthModule {}
