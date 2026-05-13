import { Categoria, Producto } from '../../../generated/prisma/client';

export type ProductWithCategory = Producto & { categoria: Categoria };

export class ProductResponseDto {
  id!: number;
  nombre!: string;
  descripcion!: string | null;
  precio!: number;
  stock!: number;
  imagenUrl!: string | null;
  activo!: boolean;
  categoria!: { id: number; nombre: string };
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(producto: ProductWithCategory): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = producto.id;
    dto.nombre = producto.nombre;
    dto.descripcion = producto.descripcion ?? null;
    dto.precio = Number(producto.precio); // Decimal → number
    dto.stock = producto.stock;
    dto.imagenUrl = producto.imagenUrl ?? null;
    dto.activo = producto.activo;
    dto.categoria = {
      id: producto.categoria.id,
      nombre: producto.categoria.nombre,
    };
    dto.createdAt = producto.createdAt;
    dto.updatedAt = producto.updatedAt;
    return dto;
  }
}
