const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const { verifyToken } = require('./auth');

// Get all orders (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('product_id')
      .populate('farmer_id');
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get order by ID (admin only)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
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

// Update order status (admin only)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    // Validate status
    const validStatuses = ['pending', 'accepted', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Find order
    const order = await Order.findById(id).populate('product_id');
    
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

// Delete order (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Order deleted successfully!'
    });
    
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
});

module.exports = router;