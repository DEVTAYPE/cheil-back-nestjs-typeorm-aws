import { Injectable } from '@nestjs/common';
import {
  CategoryWithProductsException,
  DuplicateNameException,
  NotFoundCategoryException,
} from 'src/common/exceptions';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ICategoryRepository } from './repositories/category.repository.interface';

@Injectable()
export class CategoryService {
  constructor(private readonly repository: ICategoryRepository) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.repository.findByNombre(dto.nombre);
    if (existing) throw new DuplicateNameException(dto.nombre);

    const categoria = await this.repository.create(dto);
    return CategoryResponseDto.fromEntity(categoria);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categorias = await this.repository.findAll();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return categorias.map(CategoryResponseDto.fromEntity);
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    const categoria = await this.repository.findById(id);
    if (!categoria) throw new NotFoundCategoryException(id);
    return CategoryResponseDto.fromEntity(categoria);
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const categoria = await this.repository.findById(id);
    if (!categoria) throw new NotFoundCategoryException(id);

    if (dto.nombre && dto.nombre !== categoria.nombre) {
      const existing = await this.repository.findByNombre(dto.nombre);
      if (existing) throw new DuplicateNameException(dto.nombre);
    }

    const updated = await this.repository.update(id, dto);
    return CategoryResponseDto.fromEntity(updated);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.repository.findById(id);
    if (!categoria) throw new NotFoundCategoryException(id);

    const activeProducts = await this.repository.countActiveProducts(id);
    if (activeProducts > 0)
      throw new CategoryWithProductsException(id, activeProducts);

    await this.repository.softDelete(id);
  }
}
