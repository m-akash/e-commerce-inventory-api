import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ImageUploadService {
  private readonly BUCKET_NAME = 'product-images';
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  constructor(private supabaseService: SupabaseService) {}

  async uploadImage(
    file: Express.Multer.File,
    productId: string,
    userId: string,
  ): Promise<{ imageUrl: string; fileName: string }> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `${productId}/${userId}/${randomUUID()}.${fileExtension}`;

    try {
      // Upload to Supabase Storage
      const { data, error } = await this.supabaseService
        .getStorage()
        .from(this.BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new BadRequestException(
          `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // Get public URL
      const { data: urlData } = this.supabaseService
        .getStorage()
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return {
        imageUrl: urlData.publicUrl,
        fileName: data.path,
      };
    } catch (error) {
      throw new BadRequestException(
        `Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteImage(fileName: string): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getStorage()
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        throw new BadRequestException(
          `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    } catch (error) {
      throw new BadRequestException(
        `Image deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteProductImages(productId: string, userId: string): Promise<void> {
    try {
      // List all files in the product folder
      const { data: files, error: listError } = await this.supabaseService
        .getStorage()
        .from(this.BUCKET_NAME)
        .list(`${productId}/${userId}`);

      if (listError) {
        throw new BadRequestException(
          `Failed to list images: ${listError instanceof Error ? listError.message : 'Unknown error'}`,
        );
      }

      if (files && files.length > 0) {
        const filePaths = files.map(
          (file) => `${productId}/${userId}/${file.name}`,
        );

        const { error: deleteError } = await this.supabaseService
          .getStorage()
          .from(this.BUCKET_NAME)
          .remove(filePaths);

        if (deleteError) {
          throw new BadRequestException(
            `Failed to delete product images: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`,
          );
        }
      }
    } catch (error) {
      throw new BadRequestException(
        `Product images deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size too large. Maximum size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`,
      );
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'jpg';
  }
}
