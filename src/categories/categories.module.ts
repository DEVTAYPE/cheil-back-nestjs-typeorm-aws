import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';
import { ICategoryRepository } from './repositories/category.repository.interface';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';

@Module({
  imports: [AuthModule],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    { provide: ICategoryRepository, useClass: PrismaCategoryRepository },
  ],
})
export class CategoryModule {}
