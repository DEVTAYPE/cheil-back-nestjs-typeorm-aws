import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@cheil.pe' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email!: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
