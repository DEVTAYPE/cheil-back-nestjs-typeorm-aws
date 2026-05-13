import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { IProductoRepository } from './repositories/product.repository.interface';
import { PrismaProductRepository } from './repositories/prisma-product.repository';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: IProductoRepository, useClass: PrismaProductRepository },
  ],
})
export class ProductosModule {}
