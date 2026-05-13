import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsService } from './products.service';
import { IProductoRepository } from './repositories/product.repository.interface';
import { PrismaProductRepository } from './repositories/prisma-product.repository';
import { ProductosController } from './products.controller';

@Module({
  imports: [AuthModule],
  controllers: [ProductosController],
  providers: [
    ProductsService,
    { provide: IProductoRepository, useClass: PrismaProductRepository },
  ],
})
export class ProductosModule {}
