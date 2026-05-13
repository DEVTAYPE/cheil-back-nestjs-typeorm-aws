import { Injectable } from '@nestjs/common';
import {
  DuplicateNameException,
  InvalidCategoryException,
  NotFoundProductException,
} from 'src/common/exceptions';
import { EmailService } from 'src/email/email.service';
import { S3Service } from 'src/s3/s3.service';
import { PaginatedResult } from '../common/dto/paginated-result.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductResponseDto } from './dto/product-reponse.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IProductoRepository } from './repositories/product.repository.interface';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: IProductoRepository,
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly email: EmailService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.repository.findByNombre(dto.nombre);
    if (existing) throw new DuplicateNameException(dto.nombre);

    await this.validateCategoriaExists(dto.categoriaId);

    const producto = await this.repository.create(dto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = ProductResponseDto.fromEntity(producto);

    // notificacion de email - no bloqueante
    void this.email.sendProductoCreado(response.nombre, response.precio);

    return response;
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

    // Eliminar imagen del s3 si existe
    if (producto.imagenUrl && this.s3.isConfigured) {
      void this.s3.deleteImage(producto.imagenUrl);
    }

    await this.repository.softDelete(id);
  }

  async uploadImagen(
    id: number,
    buffer: Buffer,
    mimetype: string,
  ): Promise<ProductResponseDto> {
    const producto = await this.repository.findById(id);
    if (!producto) throw new NotFoundProductException(id);

    const imageUrl = await this.s3.uploadImage(buffer, mimetype);
    const updated = await this.repository.update(id, { imagenUrl: imageUrl });
    return ProductResponseDto.fromEntity(updated);
  }

  private async validateCategoriaExists(categoriaId: number): Promise<void> {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: categoriaId, deletedAt: null },
    });
    if (!categoria) throw new InvalidCategoryException(categoriaId);
  }
}
