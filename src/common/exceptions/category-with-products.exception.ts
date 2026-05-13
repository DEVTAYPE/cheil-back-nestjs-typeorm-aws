import { ConflictException } from '@nestjs/common';

export class CategoryWithProductsException extends ConflictException {
  constructor(id: number, count: number) {
    super({
      message: `La categoría #${id} tiene ${count} producto(s) activo(s) — reasígnalos antes de eliminarla`,
      code: 'CATEGORIA_CON_PRODUCTOS',
    });
  }
}
