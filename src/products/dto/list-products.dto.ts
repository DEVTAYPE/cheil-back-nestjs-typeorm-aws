import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListProductsDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'laptop',
    description: 'Búsqueda parcial por nombre',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtrar por ID de categoría',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoriaId?: number;

  @ApiPropertyOptional({ example: 100, description: 'Precio mínimo' })
  @IsOptional()
  @Type(() => Number)
  precioMin?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Precio máximo' })
  @IsOptional()
  @Type(() => Number)
  precioMax?: number;
}
