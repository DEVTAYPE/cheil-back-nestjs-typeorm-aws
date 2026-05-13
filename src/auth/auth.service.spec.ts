import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const mockPrismaService = {
  usuario: {
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access_token on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@cheil.pe',
        password: hashedPassword,
      });

      const result = await service.login({
        email: 'admin@cheil.pe',
        password: 'Admin123!',
      });

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result).toHaveProperty('token_type', 'Bearer');
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noexiste@cheil.pe', password: 'Admin123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@cheil.pe',
        password: hashedPassword,
      });

      await expect(
        service.login({ email: 'admin@cheil.pe', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should use same error message for wrong email and wrong password', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      try {
        await service.login({ email: 'noexiste@cheil.pe', password: 'pass' });
      } catch (e) {
        expect((e as UnauthorizedException).message).toBe(
          'Credenciales inválidas',
        );
      }
    });
  });
});
