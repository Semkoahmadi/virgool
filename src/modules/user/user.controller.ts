import {
  Controller,
  Get,
  Patch,
  Put,
  UseInterceptors,
  UseGuards,
  Body,
  Res,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ProfileDto } from './dto/profile.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger.consumes.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerStorage } from 'src/common/utils/multer.util';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ProfileImage } from './types/files';
import { UploadOptionalFiles } from 'src/common/decorators/upload-file.decorator';
import { ChangeEmailDto } from './entities/profile.entity';
import { Response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { CookiesOptionToken } from 'src/common/utils/cooki.util';
import { CheckOtpDto } from '../auth/dto/auth.dto';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth('Authorization')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('/profile')
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'bg_image', maxCount: 1 },
        { name: 'profile_image', maxCount: 1 },
      ],
      {
        storage: multerStorage('user-profile'),
      }
    )
  )
  changeProfile(
    @UploadOptionalFiles() files: ProfileImage,
    @Body() profileDto: ProfileDto
  ) {
    return this.userService.changeProfile(files, profileDto);
  }

  @Get('/profile')
  profile() {
    return this.userService.profile();
  }

  @Patch('/change-email')
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { token, code, message } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.EmailOtp, token, CookiesOptionToken());
    res.json({ code, message: 'BiaTo.. ' });
  }

  @Post('/verify-email-otp')
  async verifyEmail(@Body() otpDto: CheckOtpDto) {
    return await this.userService.verifyEmail(otpDto.code)
  }
}
