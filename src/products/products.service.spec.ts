import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { IProductoRepository } from './repositories/product.repository.interface';
import { ProductsService } from './products.service';
import {
  DuplicateNameException,
  InvalidCategoryException,
  NotFoundProductException,
} from 'src/common/exceptions';

const mockRepo: jest.Mocked<IProductoRepository> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByNombre: jest.fn(),
  findByNombreExcludingId: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockPrisma = {
  categoria: { findFirst: jest.fn() },
};

const mockCategoria = { id: 1, nombre: 'Electrónica', deletedAt: null };
const mockProducto = {
  id: 1,
  nombre: 'Laptop HP',
  descripcion: null,
  precio: { toNumber: () => 2500 } as unknown as number,
  stock: 10,
  imagenUrl: null,
  activo: true,
  categoriaId: 1,
  categoria: mockCategoria,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: IProductoRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw DuplicateNameException when nombre already exists', async () => {
      mockRepo.findByNombre.mockResolvedValue(mockProducto as never);

      await expect(
        service.create({
          nombre: 'Laptop HP',
          precio: 100,
          stock: 5,
          categoriaId: 1,
        }),
      ).rejects.toThrow(DuplicateNameException);
    });

    it('should throw InvalidCategoryException when categoriaId does not exist', async () => {
      mockRepo.findByNombre.mockResolvedValue(null);
      mockPrisma.categoria.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          nombre: 'Nuevo Producto',
          precio: 100,
          stock: 5,
          categoriaId: 99,
        }),
      ).rejects.toThrow(InvalidCategoryException);
    });

    it('should create and return ProductoResponseDto on valid data', async () => {
      mockRepo.findByNombre.mockResolvedValue(null);
      mockPrisma.categoria.findFirst.mockResolvedValue(mockCategoria);
      mockRepo.create.mockResolvedValue(mockProducto as never);

      const result = await service.create({
        nombre: 'Laptop HP',
        precio: 2500,
        stock: 10,
        categoriaId: 1,
      });

      expect(result.id).toBe(1);
      expect(result.nombre).toBe('Laptop HP');
      expect(result.categoria).toEqual({ id: 1, nombre: 'Electrónica' });
      expect(result).not.toHaveProperty('deletedAt');
    });
  });

  describe('findAll', () => {
    it('should return paginated ProductoResponseDto items', async () => {
      mockRepo.findAll.mockResolvedValue({
        items: [mockProducto as never],
        total: 1,
        page: 1,
        limit: 10,
        lastPage: 1,
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.lastPage).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].nombre).toBe('Laptop HP');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundProductException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        NotFoundProductException,
      );
    });

    it('should return ProductoResponseDto when found', async () => {
      mockRepo.findById.mockResolvedValue(mockProducto as never);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });
  });

  describe('remove', () => {
    it('should call softDelete when product exists', async () => {
      mockRepo.findById.mockResolvedValue(mockProducto as never);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await service.remove(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundProductException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(
        NotFoundProductException,
      );
    });
  });
});
