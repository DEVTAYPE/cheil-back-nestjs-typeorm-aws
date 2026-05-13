import { ConflictException } from '@nestjs/common';

export class DuplicateNameException extends ConflictException {
  constructor(nombre: string) {
    super({
      message: `Ya existe un registro con el nombre "${nombre}"`,
      code: 'NOMBRE_DUPLICADO',
    });
  }
}
