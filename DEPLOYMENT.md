# Deployment Guide

This guide will help you deploy the E-commerce Inventory API to production using Render for the backend and Supabase for the database.

## 🚀 Prerequisites

- GitHub repository with the code
- Render account (free tier available)
- Supabase account (free tier available)

## 📊 Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: ecommerce-inventory-api
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Database Credentials

1. Go to **Settings** → **Database**
2. Copy the following information:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (the one you created)

### 3. Test Database Connection

You can test the connection using any PostgreSQL client or the Supabase SQL editor.

## 🌐 Backend Deployment (Render)

### 1. Connect GitHub Repository

1. Go to [Render](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Select the repository containing this code

### 2. Configure Service Settings

**Basic Settings:**

- **Name**: ecommerce-inventory-api
- **Environment**: Node
- **Region**: Choose closest to your users
- **Branch**: main (or your default branch)

**Build & Deploy:**

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Node Version**: 18.x (or latest LTS)

### 3. Environment Variables

Add the following environment variables in Render dashboard:

```env
# Database Configuration (from Supabase)
DATABASE_HOST=db.xxxxxxxxxxxxx.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-supabase-password
DATABASE_NAME=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=production
PORT=10000
```

**Important Notes:**

- Generate a strong JWT_SECRET (at least 32 characters)
- Render automatically sets the PORT, but you can override it
- Make sure all environment variable names match exactly

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Deploy to their servers

### 5. Verify Deployment

1. Wait for deployment to complete (usually 2-5 minutes)
2. Check the logs for any errors
3. Visit your service URL (e.g., `https://ecommerce-inventory-api.onrender.com`)
4. Test the Swagger documentation at `/api/docs`

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings

If you plan to use this API with a frontend, update the CORS settings in `main.ts`:

```typescript
app.enableCors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true,
});
```

### 2. Database Migrations

The application uses TypeORM with `synchronize: true` in development. For production:

1. Set `synchronize: false` in `app.module.ts`
2. Use TypeORM migrations for schema changes
3. Run migrations before deployment

### 3. Health Check Endpoint

Add a health check endpoint for monitoring:

```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

## 🔍 Monitoring and Logs

### Render Dashboard

1. **Logs**: View real-time logs in the Render dashboard
2. **Metrics**: Monitor CPU, memory, and response times
3. **Deployments**: Track deployment history and rollback if needed

### Database Monitoring (Supabase)

1. **Dashboard**: Monitor database performance
2. **Logs**: View query logs and errors
3. **Backups**: Automatic backups (daily for free tier)

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if database is accessible from Render
   - Ensure firewall settings allow connections

3. **Environment Variables**
   - Double-check all variable names and values
   - Ensure no extra spaces or quotes
   - Restart the service after adding new variables

4. **Memory Issues**
   - Free tier has limited memory
   - Optimize your application
   - Consider upgrading if needed

### Debugging Steps

1. **Check Logs**

   ```bash
   # In Render dashboard, go to Logs tab
   # Look for error messages or stack traces
   ```

2. **Test Database Connection**

   ```bash
   # Use Supabase SQL editor to test queries
   # Verify tables are created correctly
   ```

3. **Test API Endpoints**
   ```bash
   # Use Postman or curl to test endpoints
   # Check Swagger documentation
   ```

## 📈 Performance Optimization

### 1. Database Optimization

- Add indexes for frequently queried fields
- Use connection pooling
- Optimize queries

### 2. Application Optimization

- Enable compression
- Use caching where appropriate
- Optimize images and file uploads

### 3. Monitoring

- Set up alerts for errors
- Monitor response times
- Track usage patterns

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📝 Production Checklist

- [ ] Database credentials configured
- [ ] JWT secret is strong and secure
- [ ] CORS settings updated
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] Swagger documentation accessible
- [ ] All API endpoints tested
- [ ] Error handling working
- [ ] Logging configured
- [ ] Monitoring set up

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NestJS Deployment Guide](https://docs.nestjs.com/recipes/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)

## 🆘 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review Render and Supabase documentation
3. Check the application logs
4. Create an issue in the repository

---

**Your deployed API will be available at**: `https://your-service-name.onrender.com`
**Swagger Documentation**: `https://your-service-name.onrender.com/api/docs`
**Database**: Your Supabase project dashboard
