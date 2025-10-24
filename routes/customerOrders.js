const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get order by ID (public endpoint)
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('product_id')
      .populate('farmer_id');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order: order
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Get orders by customer phone (public endpoint)
router.get('/by-customer/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const orders = await Order.find({ customer_phone: phone })
      .sort({ createdAt: -1 })
      .populate('product_id')
      .populate('farmer_id');
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
    
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

module.exports = router;