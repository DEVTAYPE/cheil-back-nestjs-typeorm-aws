import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('PrismaService');

  constructor(configService: ConfigService) {
    // Prisma 7 requires an explicit driver adapter
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    const adapterConfig = {
      connectionString: databaseUrl,
      // Solo usar rejectUnauthorized: true en producción con certificados válidos
      // Para desarrollo en AWS, confiar en RDS con sslmode=require en la URL
      ...(nodeEnv === 'development' && { ssl: { rejectUnauthorized: false } }),
    };

    // this.logger.debug(`Conectando a base de datos en modo ${nodeEnv}`);

    const adapter = new PrismaPg(adapterConfig);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✓ Prisma conectado exitosamente a la base de datos');
    } catch (error) {
      this.logger.error(
        `✗ Error conectando a base de datos: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
