const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const { normalizePhone, ensureWhatsAppAddress } = require('../utils/phone');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// In-memory debug state
let lastWebhook = null;

// Green API configuration from environment variables
const GREEN_API_URL = process.env.GREEN_API_URL || 'https://7107.api.green-api.com';
const GREEN_API_MEDIA_URL = process.env.GREEN_API_MEDIA_URL || 'https://7107.api.green-api.com';
const GREEN_API_ID_INSTANCE = process.env.GREEN_API_ID_INSTANCE || '7107354839';
const GREEN_API_TOKEN_INSTANCE = process.env.GREEN_API_TOKEN_INSTANCE || '5b07156c08544004b9e719999b8b3afb10fd4aae37304efa99';

// Ensure uploads directory exists
function ensureUploadsDir() {
  const uploadsDir = path.join(__dirname, '../public/uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory at', uploadsDir);
    }
  } catch (e) {
    console.error('❌ Failed to ensure uploads directory:', e.message);
  }
}

// Extract text (supports text message and image caption)
function extractTextFromMessage(messageData) {
  if (!messageData) return '';
  const direct = messageData.textMessageData?.textMessage?.trim();
  const caption = messageData.fileMessageData?.caption?.trim();
  const extended = messageData.extendedTextMessageData?.text?.trim();
  return direct || caption || extended || '';
}

// Function to send WhatsApp message via Green API
async function sendWhatsAppMessage(messageOptions) {
  try {
    console.log(`📤 Sending message via Green API to ${messageOptions.to}...`);
    
    // Format the phone number for Green API (remove whatsapp: prefix if present)
    let toNumber = messageOptions.to;
    if (toNumber.startsWith('whatsapp:')) {
      toNumber = toNumber.replace('whatsapp:', '');
    }
    
    // Ensure the number is in international format
    const normalizedNumber = normalizePhone(toNumber);
    
    // Green API expects phone number without the + prefix
    const greenApiNumber = normalizedNumber.startsWith('+') ? normalizedNumber.substring(1) : normalizedNumber;
    
    const response = await axios.post(
      `${GREEN_API_URL}/waInstance${GREEN_API_ID_INSTANCE}/SendMessage/${GREEN_API_TOKEN_INSTANCE}`,
      {
        chatId: `${greenApiNumber}@c.us`,
        message: messageOptions.body
      }
    );
    
    console.log(`✅ Message sent successfully via Green API! Message ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending message via Green API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Function to send WhatsApp message with media via Green API
async function sendWhatsAppMessageWithMedia(to, message, mediaUrl) {
  try {
    console.log(`📤 Sending media message via Green API to ${to}...`);
    
    // Format the phone number for Green API (remove whatsapp: prefix if present)
    let toNumber = to;
    if (toNumber.startsWith('whatsapp:')) {
      toNumber = toNumber.replace('whatsapp:', '');
    }
    
    // Ensure the number is in international format
    const normalizedNumber = normalizePhone(toNumber);
    
    // Green API expects phone number without the + prefix
    const greenApiNumber = normalizedNumber.startsWith('+') ? normalizedNumber.substring(1) : normalizedNumber;
    
    const response = await axios.post(
      `${GREEN_API_URL}/waInstance${GREEN_API_ID_INSTANCE}/SendFileByUrl/${GREEN_API_TOKEN_INSTANCE}`,
      {
        chatId: `${greenApiNumber}@c.us`,
        urlFile: mediaUrl,
        fileName: 'product-image.jpg',
        caption: message
      }
    );
    
    console.log(`✅ Media message sent successfully via Green API! Message ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending media message via Green API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Function to download and save image from Green API webhook
async function downloadAndSaveImage(imageUrl) {
  try {
    console.log('📥 Downloading image from Green API...');
    
    // Download image
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      timeout: 30000 // 30 second timeout
    });
    
    // Ensure uploads directory exists
    ensureUploadsDir();

    // Generate unique filename
    const fileExtension = imageUrl.includes('.jpg') || imageUrl.includes('jpeg') ? '.jpg' : 
                         imageUrl.includes('.png') ? '.png' : '.jpg';
    const filename = `product-${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const filepath = path.join(__dirname, '../public/uploads', filename);
    
    // Save image to public/uploads directory
    fs.writeFileSync(filepath, response.data);
    
    // Return the public URL path
    const publicUrl = `/uploads/${filename}`;
    console.log(`✅ Image saved successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Error downloading image:', error.message);
    console.error('Error stack:', error.stack);
    return null;
  }
}

// WhatsApp webhook endpoint for Green API
router.post('/', async (req, res) => {
  try {
    console.log('📱 Green API Webhook received:', JSON.stringify(req.body, null, 2));
    lastWebhook = req.body;
    
    // Green API sends different payload structure than Twilio
    // Check if this is a message event
    const typeWebhook = req.body.typeWebhook || req.body.type;
    if (typeWebhook !== 'incomingMessageReceived') {
      // Not a message event, return success
      return res.status(200).json({ success: true });
    }
    
    const messageData = req.body.messageData || {};
    const textMessage = extractTextFromMessage(messageData);
    const fromChatId = req.body.senderData ? req.body.senderData.chatId : '';
    
    // Extract phone number from chatId (format: phoneNumber@c.us)
    const fromNumber = fromChatId.replace('@c.us', '');
    const numMedia = messageData.fileMessageData ? 1 : 0;
    
    console.log(`📱 WhatsApp Message from ${fromNumber}: "${textMessage}"`);
    console.log(`🖼️ Media files: ${numMedia}`);

    // Check if farmer exists
    const farmer = await Farmer.findOne({ phone: normalizePhone(fromNumber) });
    
    if (!farmer) {
      // Send response message to farmer
      try {
        await sendWhatsAppMessage({
          body: '❌ Sorry, you are not registered as a farmer. Please contact admin for registration.',
          to: `${fromNumber}@c.us`
        });
      } catch (sendError) {
        console.error('❌ Error sending response to unregistered farmer:', sendError.message);
      }
      return res.status(200).json({ success: true });
    }

    if (!farmer.isActive) {
      // Send response message to farmer
      try {
        await sendWhatsAppMessage({
          body: '❌ Your account is currently inactive. Please contact admin.',
          to: `${fromNumber}@c.us`
        });
      } catch (sendError) {
        console.error('❌ Error sending response to inactive farmer:', sendError.message);
      }
      return res.status(200).json({ success: true });
    }

    // If farmer is approved but welcome not sent yet, send it now (post-join)
    if (farmer.approvalStatus === 'approved' && !farmer.welcomeSent) {
      try {
        const welcomeMsg = `🎉 *Welcome ${farmer.name}!*\n\n` +
          `You're now connected with FarmLink AI.\n\n` +
          `You can list produce by sending: [Vegetable] [Quantity] (e.g., Tomato 50 kg)\n\n` +
          `If messages ever fail, ensure you are joined to our WhatsApp service.`;

        await sendWhatsAppMessage({
          body: welcomeMsg,
          to: `${fromNumber}@c.us`
        });
        farmer.welcomeSent = true;
        await farmer.save();
        console.log(`✅ Late welcome message delivered to ${fromNumber}`);
      } catch (e) {
        console.error('⚠️ Failed to send late welcome:', e.message);
      }
    }

    // Parse message for product listing
    // Expected format: "Product Quantity" e.g., "Tomato 30 kg" or "Onion 50kg"
    const words = (textMessage || '').trim().split(/\s+/);
    
    if (words.length < 2) {
      // Send response message to farmer
      try {
        await sendWhatsAppMessage({
          body: '❌ Invalid format. Please send: [Product Name] [Quantity]\n\nExample: Tomato 30 kg',
          to: `${fromNumber}@c.us`
        });
      } catch (sendError) {
        console.error('❌ Error sending format error response:', sendError.message);
      }
      return res.status(200).json({ success: true });
    }

    // Extract product name (all words except last 1-2 which are quantity)
    let productName = '';
    let quantity = '';
    
    // Check if last word is just number or has unit
    const lastWord = words[words.length - 1];
    const secondLastWord = words.length > 2 ? words[words.length - 2] : '';
    
    if (/^\d+$/.test(lastWord) && /^(kg|kgs|ton|tons|quintal|quintals)$/i.test(secondLastWord)) {
      // Format: "Tomato 30 kg"
      quantity = `${secondLastWord} ${lastWord}`;
      productName = words.slice(0, -2).join(' ');
    } else if (/^\d+(kg|kgs|ton|tons|quintal|quintals)$/i.test(lastWord)) {
      // Format: "Tomato 30kg"
      quantity = lastWord;
      productName = words.slice(0, -1).join(' ');
    } else if (words.length >= 3 && /^\d+$/.test(secondLastWord) && /^(kg|kgs|ton|tons|quintal|quintals)$/i.test(lastWord)) {
      // Format: "Potato 20 kg" - number and unit as last two words
      quantity = `${secondLastWord} ${lastWord}`;
      productName = words.slice(0, -2).join(' ');
    } else {
      // Assume last word is quantity
      quantity = lastWord;
      productName = words.slice(0, -1).join(' ');
    }

    if (!productName || !quantity) {
      // Send response message to farmer
      try {
        await sendWhatsAppMessage({
          body: '❌ Could not parse product details. Format: [Product Name] [Quantity]\n\nExample: Tomato 30 kg',
          to: `${fromNumber}@c.us`
        });
      } catch (sendError) {
        console.error('❌ Error sending parse error response:', sendError.message);
      }
      return res.status(200).json({ success: true });
    }

    // Get image URL if provided and download it
    let imageUrl = '';
    if (numMedia > 0 && messageData.fileMessageData) {
      // Get Green API media URL
      const greenMediaUrl = messageData.fileMessageData.downloadUrl;
      console.log(`🖼️ Original Green API URL: ${greenMediaUrl}`);
      
      // Download and save image locally
      const localImagePath = await downloadAndSaveImage(greenMediaUrl);
      
      if (localImagePath) {
        // Construct full URL for the image
        // Use the same logic as server.js for consistency
        let backendBase;
        // Use environment variable if set and not in local development
        if (process.env.BACKEND_PUBLIC_URL && process.env.NODE_ENV !== 'development') {
          backendBase = process.env.BACKEND_PUBLIC_URL;
        } else if (process.env.NODE_ENV === 'production') {
          const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          backendBase = `${proto}://${host}`;
        } else {
          // For local development, use localhost
          backendBase = `http://localhost:${process.env.PORT || 3001}`;
        }
        
        // Ensure we always use the correct production URL for deployed images
        if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_PUBLIC_URL) {
          // Fallback to the known deployed URL if environment variable is not set
          backendBase = 'https://farmlinkai-7.onrender.com';
        }
        
        // Ensure we don't have double slashes
        if (localImagePath.startsWith('/')) {
          imageUrl = `${backendBase}${localImagePath}`;
        } else {
          imageUrl = `${backendBase}/${localImagePath}`;
        }
        
        console.log(`✅ Image will be accessible at: ${imageUrl}`);
        console.log(`🔧 Backend Base URL: ${backendBase}`);
        console.log(`🔧 Local Image Path: ${localImagePath}`);
      } else {
        console.log('⚠️ Failed to download image, will use default grade');
      }
    } else {
      console.log('ℹ️ No media files attached to this message');
    }

    // Create product object with a safe default grade first (respond fast to WhatsApp)
    const newProduct = new Product({
      farmer_phone: normalizePhone(fromNumber),
      farmer_name: farmer.name,
      farmer_location: farmer.location,
      product_name: productName,
      quantity: quantity,
      image_url: imageUrl,
      status: 'available',
      quality_grade: 'pending',
      quality_score: 0
    });

    // Send immediate confirmation to farmer
    const qualityText = numMedia > 0 ? 'pending AI analysis' : 'no image provided';
    const confirmationMsg = `✅ Product Listed Successfully!\n\n` +
      `📦 Product: ${productName}\n` +
      `⚖️ Quantity: ${quantity}\n` +
      `⭐ Quality: ${qualityText}\n` +
      `📍 Location: ${farmer.location || 'Not specified'}\n\n` +
      `Your produce is now live on the marketplace! 🌾\n\n` +
      `View at: ${process.env.BACKEND_PUBLIC_URL || 'https://farmlinkai-7.onrender.com'}`;

    console.log(`📲 Sending WhatsApp confirmation to ${fromNumber}:`);
    console.log(confirmationMsg);
    
    // Try to send WhatsApp confirmation
    let whatsappSent = false;
    
    try {
      if (imageUrl && numMedia > 0) {
        // Send message with media if image was provided
        await sendWhatsAppMessageWithMedia(normalizePhone(fromNumber), confirmationMsg, imageUrl);
      } else {
        // Send text message only
        await sendWhatsAppMessage({
          body: confirmationMsg,
          to: normalizePhone(fromNumber)
        });
      }
      console.log(`✅ WhatsApp confirmation sent successfully to ${fromNumber}`);
      whatsappSent = true;
    } catch (msgError) {
      console.error(`❌ Failed to send WhatsApp confirmation to ${fromNumber}:`, msgError.message);
      console.error('Error code:', msgError.code);
      // Continue anyway - don't fail the whole process
    }
    
    // Always send success response to Green API
    res.status(200).json({ success: true });

    // Save to database in background
    setImmediate(async () => {
      try {
        console.log('💾 Saving product to database:', JSON.stringify({
          farmer_phone: newProduct.farmer_phone,
          product_name: newProduct.product_name,
          quantity: newProduct.quantity,
          image_url: newProduct.image_url
        }, null, 2));
        await newProduct.save();
        console.log('✅ Product saved to database (post-response)');
        console.log('Product ID:', newProduct._id);
        
        // Also update the frontend in real-time if WebSocket is available
        // This would require implementing WebSocket connections
      } catch (e) {
        console.error('❌ Failed to save product:', e.message);
        console.error('Error stack:', e.stack);
        
        // Try to send an error notification to the farmer
        try {
          await sendWhatsAppMessage({
            body: `⚠️ We encountered an issue saving your product listing. Please try again or contact support.`,
            to: `${fromNumber}@c.us`
          });
          console.log(`✅ Error notification sent to farmer: ${fromNumber}`);
        } catch (notifyError) {
          console.error(`❌ Failed to send error notification to ${fromNumber}:`, notifyError.message);
        }
      }

      // Fire-and-forget: call AI service to refine quality grade if image is provided
      if (imageUrl) {
        try {
          console.log('🤖 Calling AI service for quality grading (async)...');
          const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://farmlinkai-7.onrender.com';
          
          console.log(`🔧 AI Service URL: ${aiServiceUrl}`);

          // Convert local path to full URL for AI service
          // Prefer explicit BACKEND_PUBLIC_URL; otherwise derive from request headers
          const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          let backendBase = process.env.BACKEND_PUBLIC_URL || `${proto}://${host}`;
          
          // Ensure we always use the correct production URL for deployed images
          if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_PUBLIC_URL) {
            // Fallback to the known deployed URL if environment variable is not set
            backendBase = 'https://farmlinkai-7.onrender.com';
          }
          
          // Ensure we don't have double slashes
          let imageFullUrl = imageUrl;
          if (!imageUrl.startsWith('http')) {
            if (imageUrl.startsWith('/')) {
              imageFullUrl = `${backendBase}${imageUrl}`;
            } else {
              imageFullUrl = `${backendBase}/${imageUrl}`;
            }
          }
          
          console.log(`🔧 Image URL for AI service: ${imageFullUrl}`);

          const aiResponse = await axios.post(`${aiServiceUrl}/grade`, {
            image_url: imageFullUrl,
            product_name: productName
          }, {
            timeout: 30000 // 30 second timeout
          });

          if (aiResponse.data && aiResponse.data.grade) {
            await Product.findByIdAndUpdate(newProduct._id, {
              quality_grade: aiResponse.data.grade,
              quality_score: aiResponse.data.score || 0
            });
            console.log(`✅ AI Grade saved: ${aiResponse.data.grade} (Score: ${aiResponse.data.score})`);
          }
        } catch (aiError) {
          console.error('⚠️ AI service error (async):', aiError.message);
          console.error('Error stack:', aiError.stack);
          
          // Update product with error status
          try {
            await Product.findByIdAndUpdate(newProduct._id, {
              quality_grade: 'Grade B',
              quality_score: 75,
              ai_error: true
            });
            console.log('✅ Fallback grade applied due to AI service error');
          } catch (updateError) {
            console.error('❌ Failed to update product with fallback grade:', updateError.message);
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Webhook Error:', error);
    // Always send success response to Green API to avoid retries
    res.status(200).json({ success: true });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Green API WhatsApp webhook is working!' });
});

// Debug: fetch last webhook payload (do not expose in production)
router.get('/last', (req, res) => {
  res.json({ lastWebhook });
});

module.exports = router;
module.exports.sendWhatsAppMessage = sendWhatsAppMessage;
module.exports.sendWhatsAppMessageWithMedia = sendWhatsAppMessageWithMedia;
