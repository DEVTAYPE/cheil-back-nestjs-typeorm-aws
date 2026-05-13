import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly client: S3Client | null = null;
  private readonly bucket: string | null = null;
  private readonly logger = new Logger(S3Service.name);

  constructor(configService: ConfigService) {
    const region = configService.get<string>('AWS_REGION');
    const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const bucket = configService.get<string>('AWS_S3_BUCKET');

    if (region && accessKeyId && secretAccessKey && bucket) {
      this.client = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.bucket = bucket;
      this.logger.log('S3 inicializado');
    } else {
      this.logger.warn(
        'AWS S3 credenciales no configuradas. S3 no estará disponible.',
      );
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async uploadImage(buffer: Buffer, mimetype: string): Promise<string> {
    if (!this.client || !this.bucket) {
      throw new Error('S3 no esta configurado');
    }

    const extension = mimetype.split('/')[1] ?? 'jpg';
    const key = `productos/${randomUUID()}.${extension}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }),
      );
    } catch (error) {
      if (error instanceof S3ServiceException) {
        this.logger.error(`S3 error [${error.name}]: ${error.message}`);
        throw new ServiceUnavailableException(
          error.name === 'AccessDenied'
            ? 'El servidor no tiene permisos para subir imágenes a S3'
            : 'Error al subir imagen a S3',
        );
      }
      throw error;
    }

    const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;
    this.logger.log(`Image uploaded: ${url}`);
    return url;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!this.client || !this.bucket) return;

    const key = imageUrl.split('.amazonaws.com/')[1];
    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Image deleted: ${key}`);
  }
}
