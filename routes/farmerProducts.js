const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Order = require('../models/Order');
const { verifyFarmerToken } = require('./farmerAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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
  
  // Get backend base URL
  let backendBase = getBackendBase(req);
  
  // Ensure we always use the correct production URL for deployed images
  if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_PUBLIC_URL) {
    // Fallback to the known deployed URL if environment variable is not set
    backendBase = 'https://farmlinkai-7.onrender.com';
  }
  
  // Construct the full image URL - ensure no double slashes
  return `${backendBase}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const filename = `product-${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get farmer's products
router.get('/my-products', verifyFarmerToken, async (req, res) => {
  try {
    const products = await Product.find({ farmer_id: req.farmer.id })
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

// Upload product with image/video
router.post('/upload', verifyFarmerToken, upload.single('media'), async (req, res) => {
  try {
    const { product_name, quantity } = req.body;
    
    // Validate required fields
    if (!product_name || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product name and quantity are required'
      });
    }
    
    console.log(`📥 Farmer ${req.farmer.id} uploading product: ${product_name}, quantity: ${quantity}`);
    
    // Get farmer details
    const farmer = await Farmer.findById(req.farmer.id);
    if (!farmer) {
      console.error(`❌ Farmer not found for ID: ${req.farmer.id}`);
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    
    console.log(`👨‍🌾 Found farmer: ${farmer.name} (${farmer.phone})`);
    
    // Construct image URL if file was uploaded
    let imageUrl = '';
    let qualityGrade = 'pending';
    let qualityScore = 0;
    
    if (req.file) {
      // Construct the image URL - ensure no double slashes
      const filename = req.file.filename;
      imageUrl = `/uploads/${filename}`;
      
      const backendBase = getBackendBase(req);
      console.log(`✅ Image uploaded: ${backendBase}${imageUrl}`);
      
      // Try to analyze freshness with AI model
      try {
        // In a real implementation, we would call the AI service
        // For now, we'll set default values
        // TODO: Implement actual AI service integration
        qualityGrade = 'Grade B';
        qualityScore = 75;
        console.log(`🔄 AI analysis would be performed here for ${filename}`);
        
        // In a real implementation, we would do something like:
        // const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000/analyze';
        // const formData = new FormData();
        // formData.append('image', fs.createReadStream(req.file.path));
        // const aiResponse = await axios.post(aiServiceUrl, formData, {
        //   headers: formData.getHeaders()
        // });
        // const aiData = aiResponse.data;
        // qualityGrade = aiData.quality_grade;
        // qualityScore = aiData.quality_score;
      } catch (aiError) {
        console.error('⚠️ AI analysis failed:', aiError.message);
        // Use default values if AI analysis fails
        qualityGrade = 'pending';
        qualityScore = 0;
      }
    }
    
    // Create product
    const newProduct = new Product({
      farmer_id: req.farmer.id,
      farmer_phone: farmer.phone,
      farmer_name: farmer.name,
      farmer_location: farmer.location,
      product_name,
      quantity,
      image_url: imageUrl,
      status: 'available',
      quality_grade: qualityGrade,
      quality_score: qualityScore
    });
    
    try {
      await newProduct.save();
      console.log(`✅ Product saved successfully: ${newProduct._id} - ${newProduct.product_name}`);
      
      res.status(201).json({
        success: true,
        message: 'Product uploaded successfully!',
        product: newProduct
      });
    } catch (saveError) {
      console.error('❌ Error saving product to database:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving product to database',
        error: saveError.message
      });
    }
    
  } catch (error) {
    console.error('Error uploading product:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading product',
      error: error.message
    });
  }
});

// Get farmer's orders
router.get('/my-orders', verifyFarmerToken, async (req, res) => {
  try {
    const orders = await Order.find({ farmer_id: req.farmer.id })
      .sort({ createdAt: -1 })
      .populate('product_id');
    
    // Fix product image URLs for production
    const fixedOrders = orders.map(order => {
      if (order.product_id) {
        order.product_id.image_url = fixImageUrl(order.product_id.image_url, req);
      }
      return order;
    });
    
    res.json({
      success: true,
      count: fixedOrders.length,
      orders: fixedOrders
    });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Update order status
router.put('/order/:orderId/status', verifyFarmerToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;
    
    // Validate status
    const validStatuses = ['pending', 'accepted', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Find order and ensure it belongs to the farmer
    const order = await Order.findOne({ 
      _id: orderId, 
      farmer_id: req.farmer.id 
    }).populate('product_id');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    // Update product status if needed
    if (order.product_id) {
      // Update product status based on order status
      if (status === 'accepted' || status === 'dispatched') {
        order.product_id.status = 'ordered';
        await order.product_id.save();
      } else if (status === 'delivered' || status === 'cancelled') {
        order.product_id.status = status;
        await order.product_id.save();
      } else if (status === 'pending') {
        // If order is reset to pending, product becomes available again
        order.product_id.status = 'available';
        await order.product_id.save();
      }
      
      console.log(`🔄 Updated product ${order.product_id._id} status to ${order.product_id.status} based on order status ${status}`);
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: order
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

module.exports = router;