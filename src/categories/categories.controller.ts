import { Controller } from '@nestjs/common';
import { CategoryService } from './categories.service';

@Controller('categorias')
export class CategoryController {
  constructor(private readonly categoriesService: CategoryService) {}
}
