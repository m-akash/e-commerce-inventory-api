import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CategoriesService } from '../categories/categories.service';
import type { User } from '@prisma/client';

@ApiTags('Products')
@Controller('api/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Create a product with an existing category. You can either:\n1. Upload an image file using multipart/form-data (image will be stored in Supabase)\n2. Provide an imageUrl in JSON (URL will be stored directly)\nCategory must be created first using POST /api/categories.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: 'object',
  })
  @ApiResponse({ status: 400, description: 'Bad request or invalid file' })
  @ApiResponse({
    status: 404,
    description: 'Category not found. Please create a category first.',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.productsService.create(createProductDto, file, user.id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get available categories for product creation' })
  @ApiResponse({
    status: 200,
    description: 'Available categories retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
        },
      },
    },
  })
  getAvailableCategories() {
    return this.categoriesService.findAll();
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiQuery({ name: 'categoryId', required: false, type: 'string' })
  @ApiQuery({ name: 'minPrice', required: false, type: 'number' })
  @ApiQuery({ name: 'maxPrice', required: false, type: 'number' })
  @ApiQuery({ name: 'search', required: false, type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        products: { type: 'array' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or description' })
  @ApiQuery({ name: 'query', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: 'array',
  })
  search(@Query('query') searchTerm: string) {
    return this.productsService.search(searchTerm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: 'object',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: 'object',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your product' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your product' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.remove(id, user.id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload product image to Supabase Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully to Supabase Storage',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your product' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.productsService.uploadImage(id, file, user.id);
  }

  @Delete(':id/image')
  @ApiOperation({ summary: 'Delete product image from Supabase Storage' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your product' })
  @ApiResponse({ status: 400, description: 'Product has no image to delete' })
  async deleteImage(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.deleteImage(id, user.id);
  }
}
