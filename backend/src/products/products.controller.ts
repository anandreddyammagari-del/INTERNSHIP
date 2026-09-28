import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('products')
  async getAllProducts(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.productsService.findAll({
      search,
      category,
      includeInactive: includeInactive === 'true',
    });
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.update(id, dto, user.userId);
  }

  @Post('admin/products/:id/adjust-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.adjustStock(id, dto, user.userId);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.softDelete(id, user.userId);
  }
}
