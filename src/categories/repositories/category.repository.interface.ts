import { Categoria } from '../../../generated/prisma/client';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

export abstract class ICategoryRepository {
  abstract create(data: CreateCategoryDto): Promise<Categoria>;
  abstract findAll(): Promise<Categoria[]>;
  abstract findById(id: number): Promise<Categoria | null>;
  abstract findByNombre(nombre: string): Promise<Categoria | null>;
  abstract update(id: number, data: UpdateCategoryDto): Promise<Categoria>;
  abstract countActiveProducts(categoriaId: number): Promise<number>;
  abstract softDelete(id: number): Promise<void>;
}
