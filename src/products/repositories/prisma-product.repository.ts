/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Producto } from '../../../generated/prisma/client';
import { PaginatedResult } from '../../common/dto/paginated-result.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { IProductoRepository } from './product.repository.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductWithCategory } from '../dto/product-reponse.dto';
import { ListProductsDto } from '../dto/list-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

const INCLUDE_CATEGORIA = { categoria: true } as const;

@Injectable()
export class PrismaProductRepository implements IProductoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductDto): Promise<ProductWithCategory> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.prisma.producto.create({
      data,
      include: INCLUDE_CATEGORIA,
    }) as Promise<ProductWithCategory>;
  }

  async findAll(
    filters: ListProductsDto,
  ): Promise<PaginatedResult<ProductWithCategory>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        include: INCLUDE_CATEGORIA,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.producto.count({ where }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      items: items as ProductWithCategory[],
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  findById(id: number): Promise<ProductWithCategory | null> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.prisma.producto.findFirst({
      where: { id, deletedAt: null },
      include: INCLUDE_CATEGORIA,
    }) as Promise<ProductWithCategory | null>;
  }

  findByNombre(nombre: string): Promise<Producto | null> {
    return this.prisma.producto.findFirst({
      where: { nombre, deletedAt: null },
    });
  }

  findByNombreExcludingId(
    nombre: string,
    excludeId: number,
  ): Promise<Producto | null> {
    return this.prisma.producto.findFirst({
      where: { nombre, deletedAt: null, id: { not: excludeId } },
    });
  }

  update(id: number, data: UpdateProductDto): Promise<ProductWithCategory> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.prisma.producto.update({
      where: { id },
      data,
      include: INCLUDE_CATEGORIA,
    }) as Promise<ProductWithCategory>;
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.producto.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private buildWhereClause(filters: ListProductsDto) {
    return {
      deletedAt: null,
      ...(filters.nombre && {
        nombre: { contains: filters.nombre },
      }),
      ...(filters.categoriaId && { categoriaId: filters.categoriaId }),
      ...(filters.precioMin !== undefined && {
        precio: { gte: filters.precioMin },
      }),
      ...(filters.precioMax !== undefined && {
        precio: { lte: filters.precioMax },
      }),
      ...(filters.precioMin !== undefined &&
        filters.precioMax !== undefined && {
          precio: { gte: filters.precioMin, lte: filters.precioMax },
        }),
    };
  }
}
