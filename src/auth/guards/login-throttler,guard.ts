import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new HttpException(
      'Demasiados intentos. Intente nuevamente en 60 segundos.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
