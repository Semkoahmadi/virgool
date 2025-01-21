import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ProfileEntity } from './entities/profile.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OtpEntity } from './entities/otp.entity';
import { AuthModule } from '../auth/auth.module';
import { FollowEnity } from './entities/follow.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UserEntity, ProfileEntity,OtpEntity,FollowEnity])],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService,TypeOrmModule],
})
export class UserModule {}
  