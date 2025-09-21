import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PublicDbService } from '../../common/services/public-db.service';

@ApiTags('Public Database')
@Controller('public/db')
export class PublicController {
  constructor(private readonly publicDbService: PublicDbService) {}

  @Get('schema')
  @ApiOperation({ summary: 'Get database schema information' })
  @ApiResponse({
    status: 200,
    description: 'Schema information retrieved successfully',
  })
  async getSchema(@Res() res: Response) {
    const result = await this.publicDbService.getSchemaInfo();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get database table statistics' })
  @ApiResponse({
    status: 200,
    description: 'Table statistics retrieved successfully',
  })
  async getStats(@Res() res: Response) {
    const result = await this.publicDbService.getTableStats();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('info')
  @ApiOperation({ summary: 'Get database information' })
  @ApiResponse({
    status: 200,
    description: 'Database information retrieved successfully',
  })
  async getInfo(@Res() res: Response) {
    const result = await this.publicDbService.getDatabaseInfo();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test database connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  async testConnection(@Res() res: Response) {
    const result = await this.publicDbService.testConnection();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('data')
  @ApiOperation({ summary: 'Get public data (read-only)' })
  @ApiResponse({
    status: 200,
    description: 'Public data retrieved successfully',
  })
  async getPublicData(@Res() res: Response) {
    const result = await this.publicDbService.getPublicData();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('health')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  async healthCheck(@Res() res: Response) {
    const result = await this.publicDbService.testConnection();
    const status = result.success
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(status).json(result);
  }
}
