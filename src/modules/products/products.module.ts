import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { SupabaseService } from '../../common/services/supabase.service';
import { ImageUploadService } from '../../common/services/image-upload.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(), // Store files in memory for Supabase upload
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
    AuthModule,
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, SupabaseService, ImageUploadService],
  exports: [ProductsService],
})
export class ProductsModule {}
