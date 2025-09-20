import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    const { categoryId, ...productData } = createProductDto;

    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      // Get available categories to help the user
      const availableCategories = await this.prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });

      if (availableCategories.length === 0) {
        throw new NotFoundException(
          `Category with ID ${categoryId} not found. No categories exist yet. Please create a category first using POST /api/categories before creating products.`,
        );
      }

      const categoryList = availableCategories
        .map((cat) => `${cat.id}: ${cat.name}`)
        .join(', ');

      throw new NotFoundException(
        `Category with ID ${categoryId} not found. Available categories: ${categoryList}. Please create a category first using POST /api/categories before creating products.`,
      );
    }

    return this.prisma.product.create({
      data: {
        ...productData,
        categoryId,
        userId,
      },
    });
  }

  async findAll(query: ProductQueryDto): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    message?: string;
  }> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      categoryId?: number;
      price?: {
        gte?: number;
        lte?: number;
      };
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      message: products.length === 0 ? 'No products found' : undefined,
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    userId: number,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Check if user owns the product
    if (product.userId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    // Verify category exists if updating categoryId
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const product = await this.findOne(id);

    // Check if user owns the product
    if (product.userId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  async search(searchTerm: string): Promise<{
    products: Product[];
    message?: string;
  }> {
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      products,
      message:
        products.length === 0
          ? 'No products found matching your search'
          : undefined,
    };
  }

  async uploadImage(
    productId: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<{ message: string; imageUrl: string; product: Product }> {
    // Check if product exists and user owns it
    const product = await this.findOne(productId);

    if (product.userId !== userId) {
      throw new ForbiddenException(
        'You can only upload images to your own products',
      );
    }

    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Convert image to base64
    const imageBase64 = file.buffer.toString('base64');

    // Create a simple URL (in production, you'd upload to cloud storage)
    const imageUrl = `http://localhost:3000/${file.filename}`;

    // Update product with image data
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl,
        imageBase64,
      },
    });

    return {
      message: 'Image uploaded successfully',
      imageUrl,
      product: updatedProduct,
    };
  }
}
