const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Order = require('../models/Order');
const { normalizePhone } = require('../utils/phone');
const { verifyToken } = require('./auth');

// Helper function to get backend base URL
const getBackendBase = (req) => {
  // Use environment variable if set and not in local development
  if (process.env.BACKEND_PUBLIC_URL && process.env.NODE_ENV !== 'development') {
    return process.env.BACKEND_PUBLIC_URL;
  } else if (process.env.NODE_ENV === 'production') {
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${proto}://${host}`;
  } else {
    // For local development, use localhost
    return `http://localhost:${process.env.PORT || 3001}`;
  }
};

// Helper function to fix image URLs for production
const fixImageUrl = (imageUrl, req) => {
  // If image_url is already an absolute URL, return as is
  if (!imageUrl || imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Get backend base URL (derived from request/headers or env)
  const backendBase = getBackendBase(req);

  // Construct the full image URL - ensure no double slashes
  return `${backendBase}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
};

// Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Fix image URLs for production
    const fixedProducts = products.map(product => {
      product.image_url = fixImageUrl(product.image_url, req);
      return product;
    });
    
    res.json({
      success: true,
      count: fixedProducts.length,
      products: fixedProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Fix image URL for production
    product.image_url = fixImageUrl(product.image_url, req);
    
    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Place an order
router.post('/order/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { customer_name, customer_phone, customer_location, quantity } = req.body;

    // Find the product and explicitly populate farmer_id
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Log product details for debugging
    console.log('Product found:', product);
    console.log('Product farmer_id:', product.farmer_id);
    console.log('Product farmer_id type:', typeof product.farmer_id);

    // Check if farmer_id is valid
    if (!product.farmer_id) {
      console.error('Farmer ID is missing from product:', product);
      return res.status(400).json({
        success: false,
        message: 'Product is not associated with a farmer'
      });
    }

    if (product.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available'
      });
    }

    // Create order
    const newOrder = new Order({
      product_id: product._id,
      farmer_id: product.farmer_id, // This should be populated from the product
      customer_name: customer_name || 'Anonymous Customer',
      customer_phone: customer_phone || '',
      customer_location: customer_location || '',
      quantity: quantity || product.quantity,
      status: 'pending'
    });

    // Log order details for debugging
    console.log('Creating order with:', {
      product_id: newOrder.product_id,
      farmer_id: newOrder.farmer_id,
      customer_name: newOrder.customer_name
    });

    await newOrder.save();

    // Update product status
    product.status = 'ordered';
    product.buyer_name = customer_name || 'Anonymous Customer';
    product.buyer_phone = customer_phone || '';
    product.orderedAt = new Date();
    
    await product.save();

    // Order placed successfully
    console.log(`✅ Order placed successfully for product: ${product.product_name}`);

    res.json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
});

// Get products by farmer
router.get('/farmer/:phone', async (req, res) => {
  try {
    const products = await Product.find({ farmer_phone: req.params.phone })
      .sort({ createdAt: -1 });
    
    // Fix image URLs for production
    const fixedProducts = products.map(product => {
      product.image_url = fixImageUrl(product.image_url, req);
      return product;
    });
    
    res.json({
      success: true,
      count: fixedProducts.length,
      products: fixedProducts
    });
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Admin: delete ALL products (use JWT from /api/auth/login)
router.delete('/all', verifyToken, async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error('Error deleting all products:', error);
    res.status(500).json({ success: false, message: 'Error deleting products', error: error.message });
  }
});

// Admin: delete products by farmer phone (E.164)
router.delete('/by-farmer/:phone', verifyToken, async (req, res) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const result = await Product.deleteMany({ farmer_phone: phone });
    res.json({ success: true, phone, deleted: result.deletedCount });
  } catch (error) {
    console.error('Error deleting farmer products:', error);
    res.status(500).json({ success: false, message: 'Error deleting farmer products', error: error.message });
  }
});

// Manual product creation endpoint (for testing without WhatsApp)
router.post('/create', async (req, res) => {
  try {
    const { farmer_phone, product_name, quantity, image_url } = req.body;

    // Validate required fields
    if (!farmer_phone || !product_name || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Farmer phone, product name, and quantity are required'
      });
    }

    // Find farmer
    const Farmer = require('../models/Farmer');
    const farmer = await Farmer.findOne({ phone: farmer_phone });
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found. Please add farmer first in admin panel.'
      });
    }

    // Create product
    const newProduct = new Product({
      farmer_id: farmer._id, // Add this line to set farmer_id
      farmer_phone,
      farmer_name: farmer.name,
      farmer_location: farmer.location,
      product_name,
      quantity,
      image_url: image_url || '',
      status: 'available',
      quality_grade: 'Grade B',
      quality_score: 75
    });

    console.log('💾 Saving manual product to database:', JSON.stringify(newProduct, null, 2));
    await newProduct.save();
    console.log('✅ Manual product saved to database. Product ID:', newProduct._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

module.exports = router;