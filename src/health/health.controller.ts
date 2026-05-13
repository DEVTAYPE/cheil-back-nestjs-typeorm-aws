import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController extends HealthIndicator {
  private readonly logger = new Logger('HealthController');

  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([() => this.databaseCheck()]);
  }

  private async databaseCheck(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('Database health check passed');
      return this.getStatus('database', true);
    } catch (error) {
      this.logger.error(
        `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.getStatus('database', false, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
