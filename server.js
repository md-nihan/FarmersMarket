const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes with absolute paths to avoid any path resolution issues
const path = require('path');

// Use absolute paths for all route imports
const productRoutes = require(path.join(__dirname, 'routes', 'products'));
const farmerRoutes = require(path.join(__dirname, 'routes', 'farmers'));
const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const farmerAuthRoutes = require(path.join(__dirname, 'routes', 'farmerAuth'));
const farmerProductRoutes = require(path.join(__dirname, 'routes', 'farmerProducts'));
const customerOrderRoutes = require(path.join(__dirname, 'routes', 'customerOrders'));
const adminOrderRoutes = require(path.join(__dirname, 'routes', 'adminOrders'));
const freshnessRoutes = require(path.join(__dirname, 'routes', 'freshness'));

// Function to initialize services after server start
function initializeServices() {
  console.log('🔧 Initializing services...');
  
  // AI Service information
  console.log('💡 AI Service: To enable freshness detection, start the AI service with:');
  console.log('   cd ai-service && python app.py');
  console.log('   AI Service will run at: http://localhost:5000');
}

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory is properly served
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/farmer-auth', farmerAuthRoutes);
app.use('/api/farmer-products', farmerProductRoutes);
app.use('/api/customer-orders', customerOrderRoutes);
app.use('/api/admin-orders', adminOrderRoutes);
app.use('/api/freshness', freshnessRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection?.readyState;
  
  // Get the actual backend URL
  const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const derivedUrl = `${proto}://${host}`;
  
  res.json({ 
    status: 'ok', 
    message: 'FarmLink AI Server is running',
    timestamp: new Date().toISOString(),
    db: {
      connected: dbState === 1,
      readyState: dbState
    },
    config: {
      ai_service_url: process.env.AI_SERVICE_URL ? 'set' : 'unset',
      backend_public_url: process.env.BACKEND_PUBLIC_URL || derivedUrl,
      derived_backend_url: derivedUrl
    }
  });
});

// MongoDB Connection with retry (do not crash app immediately)
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink';
  const maxAttempts = 10;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB Connected Successfully');
      return;
    } catch (error) {
      const backoff = Math.min(30000, 2000 * attempt); // up to 30s
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}/${maxAttempts}):`, error.message);
      if (attempt >= maxAttempts) {
        console.error('⚠️ Max MongoDB connection attempts reached. Server will continue running; API will return errors until DB is reachable.');
        return;
      }
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
};

// Start Server
const PORT = process.env.PORT || 3001;

// Determine the public URL for the backend
const getBackendPublicUrl = (req) => {
  // Use environment variable if set
  if (process.env.BACKEND_PUBLIC_URL) {
    return process.env.BACKEND_PUBLIC_URL;
  }
  
  // For production, derive from request headers
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const derivedUrl = `${proto}://${host}`;
    
    // Fallback to known deployed URL if headers are not reliable
    if (!host || host.includes('localhost')) {
      return 'https://farmlinkai-7.onrender.com';
    }
    
    return derivedUrl;
  }
  
  // For local development, use localhost
  return `http://localhost:${process.env.PORT || 3001}`;
};

const startServer = async () => {
  // Start server first; DB connects in background/retries
  app.listen(PORT, '0.0.0.0', async () => {
    // Get the actual backend URL
    // Create a mock request object for getting the URL
    const mockReq = {
      headers: {},
      secure: false
    };
    
    const backendUrl = getBackendPublicUrl(mockReq);
    
    console.log(`
    🚀 FarmLink AI Server Started!
    
    📱 Server running at: ${backendUrl}
    🌾 Marketplace: ${backendUrl}
    👨‍💼 Admin Panel: ${backendUrl}/admin.html
    🧑‍🌾 Farmer Login: ${backendUrl}/farmer-login.html
    
    📊 API Health: ${backendUrl}/api/health
    
    🤖 AI Service: http://localhost:5000 (if running)
    `);

    // Kick off DB connect attempts
    connectDB();
    
    // Initialize other services
    initializeServices();
  });
};

startServer();

// Handle unhandled promise rejections (log but don't crash)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions (log but keep process alive)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});