import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly client: SESClient | null = null;
  private readonly fromEmail: string | null = null;
  private readonly adminEmail: string | null = null;
  private readonly logger = new Logger(EmailService.name);

  constructor(configService: ConfigService) {
    const region = configService.get<string>('AWS_REGION');
    const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const fromEmail = configService.get<string>('AWS_SES_FROM_EMAIL');
    const adminEmail = configService.get<string>('AWS_SES_ADMIN_EMAIL');

    if (region && accessKeyId && secretAccessKey && fromEmail && adminEmail) {
      this.client = new SESClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.fromEmail = fromEmail;
      this.adminEmail = adminEmail;
      this.logger.log('SES cliente inicializado');
    } else {
      this.logger.warn(
        'AWS SES credenciales no configuradas. Envío de emails deshabilitado.',
      );
    }
  }

  async sendProductoCreado(
    productoNombre: string,
    precio: number,
  ): Promise<void> {
    if (!this.client || !this.fromEmail || !this.adminEmail) return;

    try {
      await this.client.send(
        new SendEmailCommand({
          Source: this.fromEmail,
          Destination: { ToAddresses: [this.adminEmail] },
          Message: {
            Subject: {
              Data: `Nuevo producto creado: ${productoNombre}`,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: `
                  <h2>Nuevo producto registrado</h2>
                  <p><strong>Nombre:</strong> ${productoNombre}</p>
                  <p><strong>Precio:</strong> S/ ${precio.toFixed(2)}</p>
                  <p>Ingresa al sistema para ver el detalle completo.</p>
                `,
                Charset: 'UTF-8',
              },
            },
          },
        }),
      );
      this.logger.log(`Email sent for new product: ${productoNombre}`);
    } catch (error) {
      // Email failure must not block the product creation response
      this.logger.error(
        `Failed to send email for product: ${productoNombre}`,
        error,
      );
    }
  }
}
