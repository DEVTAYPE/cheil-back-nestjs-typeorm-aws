/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ICategoryRepository } from './repositories/category.repository.interface';
import { CategoryService } from './categories.service';
import {
  CategoryWithProductsException,
  DuplicateNameException,
  NotFoundCategoryException,
} from 'src/common/exceptions';

const mockRepo: jest.Mocked<ICategoryRepository> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByNombre: jest.fn(),
  update: jest.fn(),
  countActiveProducts: jest.fn(),
  softDelete: jest.fn(),
};

const mockCategoria = {
  id: 1,
  nombre: 'Electrónica',
  descripcion: 'Descripción de prueba',
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: ICategoryRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return CategoriaResponseDto', async () => {
      mockRepo.findByNombre.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockCategoria);

      const result = await service.create({ nombre: 'Electrónica' });

      expect(result.id).toBe(1);
      expect(result.nombre).toBe('Electrónica');
      expect(result).not.toHaveProperty('deletedAt');
    });

    it('should throw DuplicateNameException when nombre already exists', async () => {
      mockRepo.findByNombre.mockResolvedValue(mockCategoria);

      await expect(service.create({ nombre: 'Electrónica' })).rejects.toThrow(
        DuplicateNameException,
      );
    });
  });

  describe('findOne', () => {
    it('should return CategoriaResponseDto when found', async () => {
      mockRepo.findById.mockResolvedValue(mockCategoria);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundCategoryException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        NotFoundCategoryException,
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundCategoryException when category does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.update(99, { nombre: 'Nuevo' })).rejects.toThrow(
        NotFoundCategoryException,
      );
    });

    it('should throw DuplicateNameException when new nombre belongs to another category', async () => {
      const otra = { ...mockCategoria, id: 2, nombre: 'Ropa' };
      mockRepo.findById.mockResolvedValue(mockCategoria);
      mockRepo.findByNombre.mockResolvedValue(otra);

      await expect(service.update(1, { nombre: 'Ropa' })).rejects.toThrow(
        DuplicateNameException,
      );
    });
  });

  describe('remove', () => {
    it('should call softDelete when category has no active products', async () => {
      mockRepo.findById.mockResolvedValue(mockCategoria);
      mockRepo.countActiveProducts.mockResolvedValue(0);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundCategoryException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(
        NotFoundCategoryException,
      );
    });
  });

  it('should throw CategoriaConProductosException when category has active products', async () => {
    mockRepo.findById.mockResolvedValue(mockCategoria);
    mockRepo.countActiveProducts.mockResolvedValue(3);

    await expect(service.remove(1)).rejects.toThrow(
      CategoryWithProductsException,
    );
    expect(mockRepo.softDelete).not.toHaveBeenCalled();
  });
});
