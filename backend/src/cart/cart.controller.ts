import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getOrCreateOpenCart(user.userId);
  }

  @Post('items')
  async addItem(@CurrentUser() user: AuthUser, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(user.userId, dto);
  }

  @Patch('items/:id')
  async updateItemQty(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQty(user.userId, id, dto);
  }

  @Delete('items/:id')
  async removeItem(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cartService.removeItem(user.userId, id);
  }

  @Delete('clear')
  async clearCart(@CurrentUser() user: AuthUser) {
    return this.cartService.clearCart(user.userId);
  }
}
