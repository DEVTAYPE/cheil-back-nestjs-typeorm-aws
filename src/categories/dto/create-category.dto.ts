import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electrónica', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Dispositivos electrónicos y accesorios',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede superar 500 caracteres' })
  descripcion?: string;
}
