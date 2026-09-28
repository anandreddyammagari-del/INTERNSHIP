import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateOpenCart(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'OPEN' },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          status: 'OPEN',
        },
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // Calculate totals and stock alerts
    const items = cart.items.map((item) => {
      const isAvailable = item.product.isActive && item.product.stockQty >= item.qty;
      const subtotal = item.qty * item.product.price;
      return {
        ...item,
        isAvailable,
        subtotal,
      };
    });

    const totalAmount = items.reduce((acc, curr) => acc + curr.subtotal, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      status: cart.status,
      items,
      totalAmount,
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product not found or inactive`);
    }

    if (dto.qty > product.stockQty) {
      throw new BadRequestException(
        `Requested quantity (${dto.qty}) exceeds available stock (${product.stockQty})`,
      );
    }

    const cart = await this.getOrCreateOpenCart(userId);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.qty + dto.qty;
      if (newQty > product.stockQty) {
        throw new BadRequestException(
          `Total cart quantity (${newQty}) exceeds available stock (${product.stockQty})`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          qty: dto.qty,
        },
      });
    }

    return this.getOrCreateOpenCart(userId);
  }

  async updateItemQty(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateOpenCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException(`Cart item not found`);
    }

    if (dto.qty > item.product.stockQty) {
      throw new BadRequestException(
        `Quantity (${dto.qty}) exceeds available stock (${item.product.stockQty})`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { qty: dto.qty },
    });

    return this.getOrCreateOpenCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateOpenCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException(`Cart item not found`);
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getOrCreateOpenCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateOpenCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getOrCreateOpenCart(userId);
  }
}
