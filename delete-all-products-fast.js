const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Product model
const Product = require('./models/Product');

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete all products
const deleteAllProducts = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Count products before deletion
    const countBefore = await Product.countDocuments();
    console.log(`📊 Found ${countBefore} products in the database`);
    
    if (countBefore === 0) {
      console.log('ℹ️ No products to delete');
      process.exit(0);
    }
    
    // Delete all products without confirmation
    console.log('🗑️  Deleting all products...');
    const result = await Product.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} products`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
deleteAllProducts();