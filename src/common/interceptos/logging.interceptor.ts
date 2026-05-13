import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

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
          `${method} ${url} ${response.statusCode} — ${duration}ms [${ip}]`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        this.logger.error(
          `${method} ${url} ${error.status || 500} — ${duration}ms [${ip}] Error: ${error.message}`,
        );
        throw error;
      }),
    );
  }
}
