import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated-result.interface';
import { IProductoRepository } from './repositories/product.repository.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-reponse.dto';
import {
  DuplicateNameException,
  InvalidCategoryException,
  NotFoundProductException,
} from 'src/common/exceptions';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: IProductoRepository,
    // PrismaService used only to validate categoriaId FK existence
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.repository.findByNombre(dto.nombre);
    if (existing) throw new DuplicateNameException(dto.nombre);

    await this.validateCategoriaExists(dto.categoriaId);

    const producto = await this.repository.create(dto);
    return ProductResponseDto.fromEntity(producto);
  }

  async findAll(
    filters: ListProductsDto,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    const result = await this.repository.findAll(filters);
    return {
      ...result,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      items: result.items.map(ProductResponseDto.fromEntity),
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const producto = await this.repository.findById(id);
    if (!producto) throw new NotFoundProductException(id);
    return ProductResponseDto.fromEntity(producto);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const producto = await this.repository.findById(id);
    if (!producto) throw new NotFoundProductException(id);

    if (dto.nombre && dto.nombre !== producto.nombre) {
      const conflict = await this.repository.findByNombreExcludingId(
        dto.nombre,
        id,
      );
      if (conflict) throw new DuplicateNameException(dto.nombre);
    }

    if (dto.categoriaId && dto.categoriaId !== producto.categoriaId) {
      await this.validateCategoriaExists(dto.categoriaId);
    }

    const updated = await this.repository.update(id, dto);
    return ProductResponseDto.fromEntity(updated);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.repository.findById(id);
    if (!producto) throw new NotFoundProductException(id);
    await this.repository.softDelete(id);
  }

  private async validateCategoriaExists(categoriaId: number): Promise<void> {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: categoriaId, deletedAt: null },
    });
    if (!categoria) throw new InvalidCategoryException(categoriaId);
  }
}
