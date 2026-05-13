/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

const hashedPassword = bcrypt.hashSync('Admin123!', 10);

const mockPrismaService = {
  usuario: {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      email: 'admin@cheil.pe',
      password: hashedPassword,
    }),
  },
  categoria: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
  },
  producto: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
};

describe('Authentication flow (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 when body is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 401 with invalid credentials', () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(null);

      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'noexiste@cheil.pe', password: 'WrongPass1!' })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.statusCode).toBe(401);
        });
    });

    it('should return 200 with access_token on valid credentials', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'admin@cheil.pe',
        password: hashedPassword,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@cheil.pe', password: 'Admin123!' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('token_type', 'Bearer');

      accessToken = res.body.data.access_token;
    });
  });

  describe('GET /api/v1/productos — protected endpoint', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/productos')
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.statusCode).toBe(401);
        });
    });

    it('should return 200 with valid Bearer token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/productos')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('lastPage');
        });
    });
  });

  describe('GET /api/v1/categorias — protected endpoint', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/api/v1/categorias').expect(401);
    });

    it('should return 200 with valid Bearer token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categorias')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/health — public endpoint', () => {
    it('should be accessible without token (no 401)', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health');
      // Endpoint is public — 401 means auth required, which should NOT happen.
      // DB may be mocked/down in test env (503), but the route must be reachable.
      expect(res.status).not.toBe(401);
    });
  });
});
