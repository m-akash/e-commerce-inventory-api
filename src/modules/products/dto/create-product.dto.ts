import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'Latest iPhone with advanced features',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 999.99 })
  @Transform(({ value }: { value: any }) => parseFloat(String(value)))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @Transform(({ value }: { value: any }) => parseInt(String(value), 10))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    description:
      'Category ID (required). Category must exist before creating products.',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    required: false,
    description:
      'Optional image URL. If provided, this URL will be stored directly. If you want to upload a file, use multipart/form-data with the image field instead.',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
