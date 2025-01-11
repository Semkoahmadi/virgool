import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ProfileDto } from './dto/profile.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger.consumes.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  multerDestination,
  multerFilename,
} from 'src/common/utils/multer.util';
import { AuthGuard } from '../auth/guards/auth.guard';

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
        storage: diskStorage({
          destination: multerDestination('user-profile'),
          filename: multerFilename,
        }),
      }
    )
  )
  changeProfile(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [],
      })
    )
    files: any,
    @Body() profileDto: ProfileDto
  ) {
    return this.userService.changeProfile(files, profileDto);
  }
}
