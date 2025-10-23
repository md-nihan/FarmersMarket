const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const { verifyToken } = require('./auth');
const { normalizePhone, ensureWhatsAppAddress } = require('../utils/phone');

// Import the Green API WhatsApp messaging system
const whatsappRoutes = require('./whatsapp-green');
const sendWhatsAppMessage = whatsappRoutes.sendWhatsAppMessage;

// Farmer self-registration (public - no auth required)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, village, district, crops } = req.body;

    // Normalize phone to E.164 early
    const normalizedPhone = normalizePhone(phone);

    // Validate required fields
    if (!name || !phone || !village || !district) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, village, and district are required'
      });
    }

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ phone: normalizedPhone });
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'A farmer with this phone number is already registered',
        status: existingFarmer.approvalStatus
      });
    }

    // Create new farmer with pending status
    const newFarmer = new Farmer({
      name,
      phone: normalizedPhone,
      village,
      district,
      location: `${village}, ${district}`,
      crops: crops || '',
      approvalStatus: 'pending',
      isActive: false
    });

    await newFarmer.save();

    console.log(`🌱 New farmer registration: ${name} (${phone})`);
    console.log(`   Status: PENDING APPROVAL`);
    console.log(`   Location: ${village}, ${district}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is under review. We will contact you shortly for verification.',
      farmer: {
        name: newFarmer.name,
        phone: newFarmer.phone,
        village: newFarmer.village,
        district: newFarmer.district,
        approvalStatus: newFarmer.approvalStatus
      }
    });

  } catch (error) {
    console.error('Error in farmer registration:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
});

// Get all farmers (admin only - with status filter)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { approvalStatus: status } : {};
    
    const farmers = await Farmer.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: farmers.length,
      farmers: farmers
    });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmers',
      error: error.message
    });
  }
});

// Approve farmer (admin only)
router.post('/approve/:id', verifyToken, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    if (farmer.approvalStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Farmer is already approved'
      });
    }

    // Update farmer status
    farmer.approvalStatus = 'approved';
    farmer.isActive = true;
    farmer.approvedBy = req.admin.username;
    farmer.approvedAt = new Date();
    
    await farmer.save();

    console.log(`✅ Farmer approved: ${farmer.name} (${farmer.phone})`);
    console.log(`   Approved by: ${req.admin.username}`);

    // Send welcome WhatsApp with join instructions using Green API
    try {
      // Format phone number for Green API
      const formattedPhone = `${farmer.phone}@c.us`;
      
      console.log(`📨 Sending welcome message to approved farmer...`);
      console.log(`   To: ${formattedPhone}`);
      
      const welcomeMsg = `🎉 *Congratulations ${farmer.name}!*\n\n` +
        `Your FarmLink AI account has been APPROVED! ✅\n\n` +
        `You can now start listing your vegetables on our marketplace.\n\n` +
        `Just send: [Vegetable] [Quantity]\n\n` +
        `Examples:\n` +
        `✅ Tomato 50kg\n` +
        `✅ Onion 100 kg\n` +
        `✅ Potato 200kg\n\n` +
        `📸 You can attach photos for better prices!\n\n` +
        `Welcome to FarmLink AI! 🧑‍🌾`;

      await sendWhatsAppMessage({
        body: welcomeMsg,
        to: formattedPhone
      });

      farmer.welcomeSent = true;
      await farmer.save();

      console.log(`✅ Welcome WhatsApp sent successfully!`);
      
      res.json({
        success: true,
        message: 'Farmer approved successfully! Welcome WhatsApp sent.',
        farmer: farmer
      });
    } catch (whatsappError) {
      console.error('⚠️ Failed to send WhatsApp:', whatsappError.message);
      console.error('⚠️ Error stack:', whatsappError.stack);
      
      res.json({
        success: true,
        message: 'Farmer approved! (WhatsApp notification failed - check Green API setup)',
        farmer: farmer,
        error: whatsappError.message
      });
    }

  } catch (error) {
    console.error('Error approving farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving farmer',
      error: error.message
    });
  }
});

// Reject farmer (admin only)
router.post('/reject/:id', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const farmer = await Farmer.findById(req.params.id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    farmer.approvalStatus = 'rejected';
    farmer.isActive = false;
    farmer.rejectionReason = reason || 'Not specified';
    
    await farmer.save();

    console.log(`❌ Farmer rejected: ${farmer.name} (${farmer.phone})`);
    console.log(`   Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Farmer registration rejected',
      farmer: farmer
    });

  } catch (error) {
    console.error('Error rejecting farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting farmer',
      error: error.message
    });
  }
});

// Update farmer (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, phone, location, isActive } = req.body;
    
    const farmer = await Farmer.findById(req.params.id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    if (name) farmer.name = name;
    if (phone) farmer.phone = normalizePhone(phone);
    if (location !== undefined) farmer.location = location;
    if (isActive !== undefined) farmer.isActive = isActive;

    await farmer.save();

    res.json({
      success: true,
      message: 'Farmer updated successfully!',
      farmer: farmer
    });

  } catch (error) {
    console.error('Error updating farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating farmer',
      error: error.message
    });
  }
});

// Delete farmer (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    await Farmer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Farmer deleted successfully!'
    });

  } catch (error) {
    console.error('Error deleting farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting farmer',
      error: error.message
    });
  }
});

module.exports = router;