import { Injectable } from '@nestjs/common';
import { Categoria } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { ICategoryRepository } from './category.repository.interface';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCategoryDto): Promise<Categoria> {
    return this.prisma.categoria.create({ data });
  }

  findAll(): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findByNombre(nombre: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { nombre, deletedAt: null },
    });
  }

  update(id: number, data: UpdateCategoryDto): Promise<Categoria> {
    return this.prisma.categoria.update({ where: { id }, data });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.categoria.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
