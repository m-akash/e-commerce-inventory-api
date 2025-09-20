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
import { ImageUploadService } from '../../common/services/image-upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private imageUploadService: ImageUploadService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ product: Product; imageUrl?: string; message: string }> {
    const {
      categoryId,
      imageUrl: providedImageUrl,
      ...productData
    } = createProductDto;

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

    // Create the product first
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        categoryId,
        userId,
        imageUrl: providedImageUrl, // Store the provided imageUrl if any
      },
    });

    let finalImageUrl: string | undefined = providedImageUrl;
    let message = 'Product created successfully';

    // If image file is provided, upload it
    if (file) {
      try {
        const uploadResult = await this.imageUploadService.uploadImage(
          file,
          product.id,
          userId,
        );

        // Update product with image URL
        const updatedProduct = await this.prisma.product.update({
          where: { id: product.id },
          data: {
            imageUrl: uploadResult.imageUrl,
          },
        });

        finalImageUrl = uploadResult.imageUrl;
        message =
          'Product created successfully with image uploaded to Supabase Storage';

        return {
          product: updatedProduct,
          imageUrl: finalImageUrl,
          message,
        };
      } catch (error) {
        // If image upload fails, we still have the product created
        // Log the error but don't fail the entire operation
        console.warn(
          `Failed to upload image for product ${product.id}:`,
          error,
        );
        message = 'Product created successfully, but image upload failed';
      }
    }

    return {
      product,
      imageUrl: finalImageUrl,
      message,
    };
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
      categoryId?: string;
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

  async findOne(id: string): Promise<Product> {
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
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
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

  async remove(id: string, userId: string): Promise<void> {
    const product = await this.findOne(id);

    // Check if user owns the product
    if (product.userId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    // Delete associated images from Supabase Storage
    if (product.imageUrl) {
      try {
        await this.imageUploadService.deleteProductImages(id, userId);
      } catch (error) {
        // Log error but don't fail the product deletion
        console.warn(
          `Failed to delete images for product ${id}:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
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
    productId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ message: string; imageUrl: string; product: Product }> {
    // Check if product exists and user owns it
    const product = await this.findOne(productId);

    if (product.userId !== userId) {
      throw new ForbiddenException(
        'You can only upload images to your own products',
      );
    }

    // Upload image to Supabase Storage
    const { imageUrl } = await this.imageUploadService.uploadImage(
      file,
      productId,
      userId,
    );

    // Update product with new image URL
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl,
      },
    });

    return {
      message: 'Image uploaded successfully to Supabase Storage',
      imageUrl,
      product: updatedProduct,
    };
  }

  async deleteImage(
    productId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Check if product exists and user owns it
    const product = await this.findOne(productId);

    if (product.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete images from your own products',
      );
    }

    if (!product.imageUrl) {
      throw new BadRequestException('Product has no image to delete');
    }

    // Delete images from Supabase Storage
    await this.imageUploadService.deleteProductImages(productId, userId);

    // Update product to remove image URL
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: null,
      },
    });

    return {
      message: 'Image deleted successfully',
    };
  }
}
