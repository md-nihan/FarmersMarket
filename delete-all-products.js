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
    
    // Confirm deletion
    console.log('⚠️  This will delete ALL products from the database');
    console.log('⚠️  This action cannot be undone');
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Type "DELETE ALL" to confirm: ', async (answer) => {
      if (answer === 'DELETE ALL') {
        try {
          const result = await Product.deleteMany({});
          console.log(`✅ Successfully deleted ${result.deletedCount} products`);
        } catch (error) {
          console.error(`❌ Error deleting products: ${error.message}`);
        }
      } else {
        console.log('❌ Deletion cancelled');
      }
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
deleteAllProducts();