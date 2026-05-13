import { NotFoundException } from '@nestjs/common';

export class NotFoundCategoryException extends NotFoundException {
  constructor(id: number) {
    super({
      message: `Categoría #${id} no encontrada`,
      code: 'CATEGORIA_NOT_FOUND',
    });
  }
}
