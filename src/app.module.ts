import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
        CORS_ORIGINS: Joi.string().default('http://localhost:3001'),
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
