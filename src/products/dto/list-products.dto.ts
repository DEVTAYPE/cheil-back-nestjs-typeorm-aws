import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListProductsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoriaId?: number;

  @IsOptional()
  @Type(() => Number)
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  precioMax?: number;
}
