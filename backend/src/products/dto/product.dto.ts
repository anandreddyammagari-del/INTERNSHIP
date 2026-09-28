import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQty?: number;
}

export class AdjustStockDto {
  @IsNotEmpty()
  @IsNumber()
  delta: number; // Positive (restock) or negative (shrinkage/damage)

  @IsNotEmpty()
  @IsString()
  reason: 'RESTOCK' | 'DAMAGE_WRITE_OFF' | 'MANUAL_CORRECTION';
}
