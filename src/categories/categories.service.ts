import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from './repositories/category.repository.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  DuplicateNameException,
  NotFoundCategoryException,
} from 'src/common/exceptions';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
    await this.repository.softDelete(id);
  }
}
