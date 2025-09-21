const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { join } = require('path');
const { AppModule } = require('../dist/app.module');

let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Enable CORS
    app.enableCors();

    // Serve static files from uploads directory
    app.useStaticAssets(join(__dirname, '..', 'uploads'));

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('E-commerce Inventory API')
      .setDescription(
        'A comprehensive RESTful API for e-commerce inventory management',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication endpoints')
      .addTag('Products', 'Product management endpoints')
      .addTag('Categories', 'Category management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        docExpansion: 'none',
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'E-commerce Inventory API',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
      ],
    });

    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const nestApp = await createApp();
  const server = nestApp.getHttpAdapter().getInstance();
  server(req, res);
};
