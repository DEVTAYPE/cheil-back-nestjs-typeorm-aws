import { NotFoundException } from '@nestjs/common';

export class NotFoundProductException extends NotFoundException {
  constructor(id: number) {
    super({
      message: `Producto #${id} no encontrado`,
      code: 'PRODUCTO_NOT_FOUND',
    });
  }
}
