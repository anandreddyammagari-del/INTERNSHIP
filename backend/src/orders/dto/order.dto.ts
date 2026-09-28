import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsString()
  poNumber?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsIn(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'], {
    message: 'Status must be one of: PENDING, CONFIRMED, FULFILLED, CANCELLED',
  })
  status: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
}
