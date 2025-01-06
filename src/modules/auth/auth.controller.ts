import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger.consumes.enum';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('user-existence')
  @ApiConsumes(SwaggerConsumes.Json, SwaggerConsumes.UrlEncoded)
  userExistence(@Body() authDto: AuthDto) {
    return this.authService.userExistence(authDto);
  }
}
