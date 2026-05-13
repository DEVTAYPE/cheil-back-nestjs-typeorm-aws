import { Categoria } from '../../../generated/prisma/client';

export class CategoryResponseDto {
  id!: number;
  nombre!: string;
  descripcion!: string | null;
  activo!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(categoria: Categoria): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = categoria.id;
    dto.nombre = categoria.nombre;
    dto.descripcion = categoria.descripcion ?? null;
    dto.activo = categoria.activo;
    dto.createdAt = categoria.createdAt;
    dto.updatedAt = categoria.updatedAt;
    return dto;
  }
}
