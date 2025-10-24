const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'farmlink-ai-farmer-secret-key-2025';

// Farmer login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and password are required'
            });
        }

        // Find farmer by phone number
        const farmer = await Farmer.findOne({ phone });
        
        if (!farmer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if farmer has a password set
        if (!farmer.password) {
            return res.status(401).json({
                success: false,
                message: 'Please register with a password first'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, farmer.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if farmer is approved and active
        if (farmer.approvalStatus !== 'approved' || !farmer.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account is not approved or is inactive. Please contact admin.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: farmer._id, 
                phone: farmer.phone, 
                name: farmer.name,
                role: 'farmer' 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            farmer: {
                id: farmer._id,
                name: farmer.name,
                phone: farmer.phone,
                village: farmer.village,
                district: farmer.district,
                approvalStatus: farmer.approvalStatus
            }
        });

    } catch (error) {
        console.error('Farmer login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Farmer registration with password
router.post('/register', async (req, res) => {
    try {
        const { name, phone, village, district, crops, password } = req.body;

        // Validate required fields
        if (!name || !phone || !village || !district || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone number, village, district, and password are required'
            });
        }

        // Check if farmer already exists
        const existingFarmer = await Farmer.findOne({ phone });
        if (existingFarmer) {
            return res.status(400).json({
                success: false,
                message: 'A farmer with this phone number is already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new farmer
        const newFarmer = new Farmer({
            name,
            phone,
            village,
            district,
            location: `${village}, ${district}`,
            crops: crops || '',
            approvalStatus: 'pending',
            isActive: false,
            password: hashedPassword
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

// Verify token middleware
const verifyFarmerToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.farmer = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Verify token endpoint
router.get('/verify', verifyFarmerToken, (req, res) => {
    res.json({
        success: true,
        farmer: req.farmer
    });
});

module.exports = router;
module.exports.verifyFarmerToken = verifyFarmerToken;