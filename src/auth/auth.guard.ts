import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('JwtStrategy') {
  handleRequest(err: any, user: any, info: any): any {
    if (info instanceof TokenExpiredError) {
      throw new HttpException(
        {
          code: 401,
          message: 'Token expired',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (err || !user) {
      throw new HttpException(
        {
          code: 401,
          message: 'Invalid token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
