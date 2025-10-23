const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const { ensureWhatsAppAddress, normalizePhone } = require('../utils/phone');
const { verifyToken } = require('./auth');

// We'll import the sendWhatsAppMessage function from Green API whatsapp routes
const whatsappRoutes = require('./whatsapp-green');
const sendWhatsAppMessage = whatsappRoutes.sendWhatsAppMessage;

// Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Fix image URLs for production
    const fixedProducts = products.map(product => {
      if (product.image_url && product.image_url.includes('localhost:3001')) {
        product.image_url = product.image_url.replace('http://localhost:3001', 'https://farmlinkai-7.onrender.com');
      }
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
    if (product.image_url && product.image_url.includes('localhost:3001')) {
      product.image_url = product.image_url.replace('http://localhost:3001', 'https://farmlinkai-7.onrender.com');
    }
    
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
    const { buyer_name, buyer_phone } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available'
      });
    }

    // Update product status
    product.status = 'ordered';
    product.buyer_name = buyer_name || 'Anonymous Buyer';
    product.buyer_phone = buyer_phone || '';
    product.orderedAt = new Date();
    
    await product.save();

    // Send WhatsApp notification to farmer
    try {
      // Format phone number for Green API
      const formattedPhone = `${product.farmer_phone}@c.us`;
      
      console.log(`📨 Sending order notification...`);
      console.log(`   To: ${formattedPhone}`);
      
      const notificationMsg = `🎉 *Order Alert!*\n\n` +
        `A buyer wants to purchase your produce:\n\n` +
        `📦 Product: ${product.product_name}\n` +
        `⚖️ Quantity: ${product.quantity}\n` +
        `👤 Buyer: ${buyer_name || 'Anonymous'}\n` +
        `📞 Contact: ${buyer_phone || 'Will call you'}\n\n` +
        `Please prepare the order for dispatch! 🚜`;

      await sendWhatsAppMessage({
        body: notificationMsg,
        to: formattedPhone
      });

      console.log(`✅ Order notification sent successfully!`);
    } catch (whatsappError) {
      console.error('⚠️ Failed to send WhatsApp notification:', whatsappError.message);
      console.error('⚠️ Error stack:', whatsappError.stack);
      // Don't fail the order if notification fails
    }

    res.json({
      success: true,
      message: 'Order placed successfully!',
      product: product
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
      if (product.image_url && product.image_url.includes('localhost:3001')) {
        product.image_url = product.image_url.replace('http://localhost:3001', 'https://farmlinkai-7.onrender.com');
      }
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

    // Send confirmation notification via WhatsApp
    try {
      // Format phone number for Green API
      const formattedPhone = `${farmer_phone}@c.us`;
      
      const confirmationMsg = `✅ Product Listed Successfully!\n\n` +
        `📦 Product: ${product_name}\n` +
        `⚖️ Quantity: ${quantity}\n` +
        `⭐ Quality: ${newProduct.quality_grade}\n` +
        `📍 Location: ${farmer.location || 'Not specified'}\n\n` +
        `Your produce is now live on the marketplace! 🌾\n\n` +
        `View at: ${process.env.BACKEND_PUBLIC_URL || 'https://farmlinkai-7.onrender.com'}`;

      await sendWhatsAppMessage({
        body: confirmationMsg,
        to: formattedPhone
      });
      
      console.log(`✅ WhatsApp confirmation sent to farmer: ${farmer_phone}`);
    } catch (notificationError) {
      console.error(`❌ Failed to send WhatsApp confirmation to ${farmer_phone}:`, notificationError.message);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully! WhatsApp confirmation sent to farmer.',
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