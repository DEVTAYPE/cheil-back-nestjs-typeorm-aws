import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable, tap } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      ip: string;
    }>();
    const { method, url, ip } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context
          .switchToHttp()
          .getResponse<{ statusCode: number }>();
        const duration = Date.now() - start;
        this.logger.log(
          'info',
          `${method} ${url} ${response.statusCode} ${duration}ms`,
          {
            ip,
            context: 'HTTP',
          },
        );
      }),
    );
  }
}
