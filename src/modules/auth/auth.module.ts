import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenService } from './tokens.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ProfileEntity } from '../user/entities/profile.entity';
import { OtpEntity } from '../user/entities/otp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OtpEntity, ProfileEntity])],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtService],
  exports:[AuthService, TokenService, JwtService,TypeOrmModule]
})
export class AuthModule {}
