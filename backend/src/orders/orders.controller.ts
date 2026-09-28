import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  @Roles('BUYER')
  async checkout(
    @CurrentUser() user: AuthUser,
    @Body() dto: CheckoutDto,
  ) {
    return this.ordersService.checkout(user, dto);
  }

  @Get()
  async getOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  async getOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles('SALES_REP', 'ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }
}
