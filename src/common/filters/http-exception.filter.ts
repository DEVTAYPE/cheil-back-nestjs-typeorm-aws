import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, code } = this.resolveException(exception);

    this.logger.error(
      `${request.method} ${request.url} ${status} — ${message}`,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      code,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string;
    code: string | null;
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && 'message' in res
          ? String((res as Record<string, unknown>).message)
          : exception.message;
      const code =
        typeof res === 'object' && 'code' in res
          ? String((res as Record<string, unknown>).code)
          : null;
      return { status: exception.getStatus(), message, code };
    }

    // Unhandled errors — never expose internals in production
    this.logger.error('Unhandled exception', exception);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    };
  }
}
