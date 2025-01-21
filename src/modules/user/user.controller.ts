import {Controller,Get,Patch,Put,UseInterceptors,UseGuards,Body,Res,Post, Param, ParseIntPipe, Query} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProfileDto } from './dto/profile.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger.consumes.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerStorage } from 'src/common/utils/multer.util';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ProfileImage } from './types/files';
import { UploadOptionalFiles } from 'src/common/decorators/upload-file.decorator';
import {ChangeEmailDto,ChangePhoneDto,ChangeUsernameDto} from './dto/profile.dto';
import { Response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { CookiesOptionToken } from 'src/common/utils/cooki.util';
import { CheckOtpDto, UserBlockDto } from '../auth/dto/auth.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { Pagination } from 'src/common/decorators/pagination.decorators';
import { PaginationDto } from 'src/common/dtos/pagination..dto';

@Controller('user')
@ApiTags('User')
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Put('/profile')
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(FileFieldsInterceptor(
      [
        { name: 'bg_image', maxCount: 1 },
        { name: 'profile_image', maxCount: 1 },
      ], {
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
    return this.userService.profile()
  }

  @Get('/list')
  @Pagination()
  find(@Query() paginationDto:PaginationDto) {
    return this.userService.find(paginationDto)
  }
  @Get('/followers')
  @Pagination()
  followers(@Query() paginationDto:PaginationDto) {
    return this.userService.followers(paginationDto)
  }

  @Get('/following')
  @Pagination()
  following(@Query() paginationDto:PaginationDto) {
    return this.userService.following(paginationDto)
  }

  @Get('/follow/:followingId')
  @ApiParam({name:"followingId"})
  follow(@Param("followingId",ParseIntPipe) followingId: number) {
    return this.userService.followToggle(followingId)
  }

  @Patch('/change-email')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { token, code, message } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.EmailOtp, token, CookiesOptionToken());
    res.json({ code, message: 'BiaTo.. ' });
  }

  @Post('/verify-email-otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDto: CheckOtpDto) {
    return await this.userService.verifyEmail(otpDto.code);
  }

  @Patch('/change-phone')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { token, code, message } = await this.userService.changePhone(
      phoneDto.phone
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.PhoneOTp, token, CookiesOptionToken());
    res.json({ code, message: 'BiaTo.. ' });
  }

  @Post('/verify-phone-otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDto: CheckOtpDto) {
    return await this.userService.verifyPhone(otpDto.code);
  }

  @Patch('/change-username')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }

  @Post('/block')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async block(@Body() blockDto: UserBlockDto) {
    return this.userService.blockToggle(blockDto);
    
  }
}
