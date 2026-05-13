import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede superar 150 caracteres' })
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'La descripción no puede superar 1000 caracteres',
  })
  descripcion?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido con máximo 2 decimales' },
  )
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  precio!: number;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock!: number;

  @IsInt({ message: 'El ID de categoría debe ser un número entero' })
  @IsPositive({ message: 'El ID de categoría debe ser positivo' })
  categoriaId!: number;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de imagen no tiene un formato válido' })
  imagenUrl?: string;
}
