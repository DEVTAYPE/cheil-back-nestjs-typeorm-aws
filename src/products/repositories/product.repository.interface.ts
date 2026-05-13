import { Producto } from '../../../generated/prisma/client';
import { PaginatedResult } from '../../common/dto/paginated-result.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { ListProductsDto } from '../dto/list-products.dto';
import { ProductWithCategory } from '../dto/product-reponse.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export abstract class IProductoRepository {
  abstract create(data: CreateProductDto): Promise<ProductWithCategory>;
  abstract findAll(
    filters: ListProductsDto,
  ): Promise<PaginatedResult<ProductWithCategory>>;
  abstract findById(id: number): Promise<ProductWithCategory | null>;
  abstract findByNombre(nombre: string): Promise<Producto | null>;
  abstract findByNombreExcludingId(
    nombre: string,
    excludeId: number,
  ): Promise<Producto | null>;
  abstract update(
    id: number,
    data: UpdateProductDto,
  ): Promise<ProductWithCategory>;
  abstract softDelete(id: number): Promise<void>;
}
