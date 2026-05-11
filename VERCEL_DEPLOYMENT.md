# Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Push Code to GitHub
Make sure your code is pushed to a GitHub repository (without the `.env` file).

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `my-app` (if your project is in a subfolder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)

### 3. Environment Variables
Add these environment variables in Vercel dashboard (Project Settings > Environment Variables):

```
# Required Variables
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secure-random-secret-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Database
MONGODB_URI=your-mongodb-connection-string

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token

# AI API
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_RAPIDAPI_KEY=your-rapidapi-key

# Base URL
BASE_URL=https://your-app-name.vercel.app
```

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## 🔧 Troubleshooting

### Build Errors
- **bcrypt issues**: ✅ Fixed - removed native bcrypt, using bcryptjs
- **Environment variables**: Make sure all required env vars are set in Vercel dashboard
- **MongoDB connection**: Ensure your MongoDB URI allows connections from `0.0.0.0/0`

### Runtime Errors
- **Database connection**: Check MongoDB Atlas network access
- **Redis connection**: Verify Upstash credentials
- **Auth redirects**: Update `NEXTAUTH_URL` to your Vercel domain

### Performance
- **Cold starts**: Expected on Vercel's free tier
- **API timeouts**: Some APIs may need optimization for serverless

## ✅ What's Fixed
- ✅ Removed problematic `bcrypt` dependency
- ✅ Added `vercel.json` configuration
- ✅ Build succeeds locally
- ✅ Environment variables properly configured

## 🚨 Security Notes
- Never commit `.env` files to git
- Use strong secrets for `NEXTAUTH_SECRET`
- Restrict MongoDB access to necessary IPs only
- Keep API keys secure