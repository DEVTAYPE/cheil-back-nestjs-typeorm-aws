import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Productos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Categoría inválida o datos incorrectos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un producto con ese nombre',
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'nombre',
    required: false,
    type: String,
    example: 'laptop',
  })
  @ApiQuery({ name: 'categoriaId', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'precioMin', required: false, type: Number, example: 100 })
  @ApiQuery({ name: 'precioMax', required: false, type: Number, example: 5000 })
  @ApiResponse({ status: 200, description: 'Lista paginada de productos' })
  findAll(@Query() filters: ListProductsDto) {
    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Nombre ya en uso por otro producto',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto (soft delete)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
