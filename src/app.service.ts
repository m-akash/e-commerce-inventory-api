import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to E-commerce Inventory API! Visit /api/docs for Swagger documentation.';
  }
}
