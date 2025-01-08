import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { isJWT, IsJWT } from 'class-validator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const token = this.extractToken(request)
    request.user = await this.authService.validateAccessToken(token);
    return true
  }
  protected extractToken(request: Request) {
    const { authorization } = request.headers;
    if (!authorization || authorization?.trim() == '')
      throw new BadRequestException('No token provided');
    const [bearer, token] = authorization?.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !token || !isJWT(token))
      throw new BadRequestException('Invalid token');
    return token;
  }
}
