# E-commerce Inventory API

A comprehensive RESTful API for e-commerce inventory management built with NestJS, TypeScript, Neon PostgreSQL, Prisma and Supabase Storage.

## Features

- **Authentication & Authorization**: JWT-based authentication with secure user registration and login
- **Product Management**: Full CRUD operations for products with image upload support
- **Category Management**: Organize products with hierarchical category system
- **Image Upload**: Cloud-based image storage using Supabase Storage and multer
- **API Documentation**: Interactive Swagger documentation
- **Data Validation**: Comprehensive input validation using class-validator
- **CORS Support**: Cross-origin resource sharing enabled
- **Cloud Ready**: Optimized for Vercel serverless deployment
- **Database**: Neon PostgreSQL for data storage
- **TypeScript**: Full type safety and better developer experience

## Live Demo

- **Backend API**: https://e-commerce-inventory-api.vercel.app/
- **API Documentation**: https://e-commerce-inventory-api.vercel.app/api/docs
- **Database Dashboard**: postgresql://username:password@ep-empty-flower-a14lv8u8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

## Quick Setup

### Prerequisites

- Node.js (v18 or higher)
- Neon account (for database)
- Supabase account (for file storage)
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/m-akash/e-commerce-inventory-api
cd e-commerce-inventory-api
npm install
```

### 2. Environment Variables

```bash
cp env.example .env
```

**For Neon + Supabase:**

```env
# Database Configuration (Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Supabase for images only
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
PORT=3000
NODE_ENV=development
```

**For Local PostgreSQL:**

```env
# Database Configuration for local
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=ecommerce_inventory

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 4. Start Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 5. Verify Setup

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product by ID
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/upload-image` - Upload image (Supabase integration)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/categories/:id` - Get category by ID
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 🔧 Tech Stack

- **Backend**: NestJS & TypeScript
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Supabase Storage with Multer
- **Deployment**: Vercel (Serverless Functions)
- **Cloud Storage**: Supabase Storage

## Environment Variables

| Variable                    | Description                | Default     |
| --------------------------- | -------------------------- | ----------- |
| `DATABASE_URL`              | Database connection string | Required    |
| `JWT_SECRET`                | JWT secret key             | Required    |
| `JWT_EXPIRES_IN`            | JWT expiration time        | 24h         |
| `SUPABASE_URL`              | Supabase project URL       | Required    |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key     | Required    |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key  | Required    |
| `PORT`                      | Application port           | 3000        |
| `NODE_ENV`                  | Environment                | development |

## Deployment

### Using Vercel + Neon + Supabase (Recommended)

1. **Deploy to Vercel:**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

2. **Set up Neon Database:**
   - Create a new project on [Neon](https://neon.tech)
   - Get your database connection string
   - Run migrations: `npx prisma migrate deploy`

3. **Set up Supabase Storage:**
   - Create a new project on [Supabase](https://supabase.com)
   - Get your API keys (anon key and service role key)
   - Set up storage bucket for images

4. **Configure Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add all required environment variables from the table above

5. **Deploy:**
   ```bash
   # Build and deploy
   npm run vercel-build
   vercel --prod
   ```

## Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run vercel-build` - Build for Vercel deployment
- `npm run vercel-dev` - Start Vercel development server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
