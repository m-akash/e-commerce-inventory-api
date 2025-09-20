# E-commerce Inventory API

A comprehensive RESTful API for e-commerce inventory management built with NestJS, TypeScript, and PostgreSQL. This API provides secure CRUD operations for products and categories, JWT-based authentication, and advanced filtering capabilities.

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with guards

### Product Management

- Create, read, update, delete products
- Advanced filtering (by category, price range)
- Pagination support
- Search functionality
- Image upload support (base64 or URL)
- User ownership validation

### Category Management

- Full CRUD operations for categories
- Product count tracking
- Unique name validation
- Cascade delete protection

### Additional Features

- Comprehensive Swagger documentation
- Input validation with class-validator
- Error handling with proper HTTP status codes
- CORS enabled
- TypeORM with PostgreSQL
- Domain-Driven Design (DDD) architecture

## Tech Stack

- **Backend**: Node.js with NestJS & TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **File Upload**: Multer
- **Architecture**: Domain-Driven Design (DDD)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e-commerce-inventory-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Update the `.env` file with your database credentials:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ecommerce_inventory

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE ecommerce_inventory;
```

### 5. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, you can access the interactive Swagger documentation at:

- **Swagger UI**: `http://localhost:3000/api/docs`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products

- `GET /api/products` - Get all products (with filters and pagination)
- `GET /api/products/search?q=keyword` - Search products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/upload-image` - Upload product image

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 🔍 Query Parameters

### Product Filtering

- `categoryId` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Search in name and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Example Requests

```bash
# Get products with filters
GET /api/products?categoryId=1&minPrice=10&maxPrice=100&page=1&limit=10

# Search products
GET /api/products/search?q=iPhone

# Get products by category
GET /api/products?categoryId=1
```

## Authentication

All endpoints except authentication require a JWT token. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example Authentication Flow

1. **Register a new user:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "password123"
  }'
```

2. **Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

3. **Use the token in subsequent requests:**

```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Project Structure

```
src/
├── prisma/                   # Prisma database configuration
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── modules/                  # Feature modules
│   ├── auth/                # Authentication module
│   │   ├── dto/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── products/            # Products module
│   │   ├── dto/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   └── categories/          # Categories module
│       ├── dto/
│       ├── categories.controller.ts
│       ├── categories.service.ts
│       └── categories.module.ts
├── common/                  # Shared utilities
│   ├── guards/
│   └── decorators/
├── app.module.ts
└── main.ts
```

## Deployment

### Using Render (Recommended)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure environment variables:**
   - `DATABASE_HOST` - Your PostgreSQL host
   - `DATABASE_PORT` - Database port (usually 5432)
   - `DATABASE_USERNAME` - Database username
   - `DATABASE_PASSWORD` - Database password
   - `DATABASE_NAME` - Database name
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - Set to "production"

4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm run start:prod`

### Using Supabase for Database

1. **Create a Supabase project**
2. **Get your database credentials from the Supabase dashboard**
3. **Update your environment variables with Supabase credentials**

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Environment Variables

| Variable            | Description         | Default             |
| ------------------- | ------------------- | ------------------- |
| `DATABASE_HOST`     | PostgreSQL host     | localhost           |
| `DATABASE_PORT`     | PostgreSQL port     | 5432                |
| `DATABASE_USERNAME` | Database username   | postgres            |
| `DATABASE_PASSWORD` | Database password   | password            |
| `DATABASE_NAME`     | Database name       | ecommerce_inventory |
| `JWT_SECRET`        | JWT secret key      | your-secret-key     |
| `JWT_EXPIRES_IN`    | JWT expiration time | 24h                 |
| `PORT`              | Application port    | 3000                |
| `NODE_ENV`          | Environment         | development         |

**Live Demo**: [Your Render URL here]
**Database**: [Your Supabase URL here]
**API Documentation**: [Your Swagger URL here]
