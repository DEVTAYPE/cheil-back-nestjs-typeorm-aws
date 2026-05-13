import { BadRequestException } from '@nestjs/common';

export class InvalidCategoryException extends BadRequestException {
  constructor(id: number) {
    super({
      message: `La categoría #${id} no existe`,
      code: 'CATEGORIA_INVALIDA',
    });
  }
}
