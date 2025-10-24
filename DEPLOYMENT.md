# FarmLink AI - Render Deployment Guide

## Prerequisites

1. A [Render](https://render.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
3. This GitHub repository pushed to your account

## Deployment Steps

### 1. Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine for testing)
3. Create a database user with read/write permissions
4. Add your IP address to the IP whitelist (or allow access from anywhere for testing)
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `farmlink-ai-backend`
   - **Environment**: Node
   - **Branch**: main (or your default branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random string for JWT token signing
   - `NODE_ENV`: production

6. Click "Create Web Service"

### 3. Deploy AI Service

1. In Render Dashboard, click "New" → "Web Service"
2. Connect the same GitHub repository
3. Configure the service:
   - **Name**: `farmlink-ai-service`
   - **Environment**: Python
   - **Branch**: main (or your default branch)
   - **Root Directory**: `ai-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Instance Type**: Free

4. Add Environment Variables (if needed):
   - `PORT`: 10000 (Render will set this automatically)

5. Click "Create Web Service"

### 4. Update Backend Configuration

After both services are deployed:

1. Get the URL of your AI service from Render
2. Update your backend service environment variables:
   - Add `AI_SERVICE_URL`: The URL of your AI service

### 5. Final Configuration

1. In your backend service settings on Render, add your domain to allowed origins if needed
2. Make sure both services are running (check logs if there are issues)

## Environment Variables Required

### Backend Service
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Set to "production"
- `AI_SERVICE_URL`: URL of the AI service (optional, for real AI analysis)

### AI Service
- `PORT`: Port to run on (Render sets this automatically)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check your MongoDB URI
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify database credentials

2. **CORS Errors**:
   - Check if your frontend URL is in the allowed origins

3. **AI Service Not Responding**:
   - Check if the AI service is running
   - Verify the AI_SERVICE_URL environment variable

4. **File Upload Issues**:
   - Check file size limits
   - Ensure the uploads directory has write permissions

### Checking Logs

1. Go to your service in Render Dashboard
2. Click "Logs" tab
3. Check for error messages

## Scaling

For production use:
1. Upgrade from Free tier to a paid plan
2. Consider using a more powerful instance type
3. Set up custom domains
4. Add monitoring and alerting

## Updating Your Application

To deploy updates:
1. Push changes to your GitHub repository
2. Render will automatically deploy the new version
3. Or manually trigger a deploy from the Render dashboard