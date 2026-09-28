import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  qty: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  qty: number;
}
