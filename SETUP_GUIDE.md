# 🚀 FarmLink AI - Complete Setup Guide

## ⚠️ Important Notice

**This guide is for legacy Twilio setup. For new installations, please use the [Green API Setup Guide](GREEN_API_SETUP.md).**

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- ✅ **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- ✅ **MongoDB Atlas Account** (Free) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- ✅ **Green API Account** (Free trial) - [Sign up here](https://green-api.com/) (Recommended)

**Note:** This project has been migrated from Twilio to Green API for better reliability and features. Please use the Green API setup guide for new installations.

---

## 📋 Step-by-Step Setup

### Step 1: MongoDB Atlas Setup

1. **Create a MongoDB Atlas cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account
   - Click "Build a Database"
   - Choose the **FREE** M0 tier
   - Select a region closest to you
   - Click "Create Cluster"

2. **Create a database user:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `farmlink-admin`
   - Password: Generate a secure password (save it!)
   - User Privileges: "Atlas admin"
   - Click "Add User"

3. **Whitelist your IP address:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

4. **Get your connection string:**
   - Go to "Databases" tab
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://...`)
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `farmlink`

### Step 2: Green API WhatsApp Setup (Recommended)

**For new installations, please refer to the [Green API Setup Guide](GREEN_API_SETUP.md).**

If you still want to use Twilio, continue with the steps below:

### Step 2: Twilio WhatsApp Setup (Legacy)

1. **Create a Twilio account:**
   - Go to [Twilio](https://www.twilio.com/try-twilio)
   - Sign up for a free account
   - Complete phone verification

2. **Access WhatsApp Sandbox:**
   - In Twilio Console, go to: Messaging → Try it out → Send a WhatsApp message
   - You'll see a WhatsApp number (e.g., `+1 415 523 8886`)
   - Follow instructions to join the sandbox from your phone
   - Send the code (e.g., "join <code>") to the Twilio WhatsApp number

3. **Get your credentials:**
   - Account SID: Found on Twilio Dashboard
   - Auth Token: Found on Twilio Dashboard (click to reveal)
   - WhatsApp Number: The sandbox number (format: `whatsapp:+14155238886`)

### Step 3: Project Installation

1. **Open PowerShell and navigate to project:**
   ```powershell
   cd "c:\Users\nihan\OneDrive\Desktop\hackathon\farmerproject  with green api"
   ```

2. **Install Node.js dependencies:**
   ```powershell
   npm install
   ```

3. **Install Python dependencies:**
   ```powershell
   cd ai-service
   pip install -r requirements.txt
   cd ..
   ```

### Step 4: Environment Configuration

1. **Create `.env` file:**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit `.env` file with your credentials:**
   - Open `.env` in a text editor
   - Fill in your values:

   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://farmlink-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/farmlink?retryWrites=true&w=majority

   # Green API WhatsApp Configuration (Recommended)
   GREEN_API_URL=https://7107.api.green-api.com
   GREEN_API_MEDIA_URL=https://7107.api.green-api.com
   GREEN_API_ID_INSTANCE=7107354839
   GREEN_API_TOKEN_INSTANCE=your_instance_token_here

   # Twilio WhatsApp Configuration (Legacy - Only if not using Green API)
   # TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   # TWILIO_AUTH_TOKEN=your_auth_token_here
   # TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   # TWILIO_PHONE_NUMBER=+14155238886

   # AI Service Configuration
   AI_SERVICE_URL=http://localhost:5000

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   DEFAULT_COUNTRY_CODE=+91
   ```

### Step 5: Running the Application

**You need 2 terminal windows:**

**Terminal 1 - Start AI Service:**
```powershell
cd ai-service
python app.py
```

Wait for: `✅ Model loaded successfully!`

**Terminal 2 - Start Backend Server:**
```powershell
npm start
```

Wait for: `🚀 FarmLink AI Server Started!`

### Step 6: Access the Platform

Open your browser and visit:

- **Marketplace:** http://localhost:3001
- **Admin Panel:** http://localhost:3001/admin.html
- **API Health:** http://localhost:3001/api/health

---

## 🧪 Testing the Complete Workflow

### Test 1: Add a Farmer (Admin Panel)

1. Open http://localhost:3001/admin.html
2. Fill in the form:
   - **Name:** Parvati Devi
   - **Phone:** YOUR_WHATSAPP_NUMBER (with country code, e.g., +911234567890)
   - **Location:** Bengaluru Rural
3. Click "Add Farmer"
4. You should see success message

### Test 2: List a Product (WhatsApp)

1. On your phone, open WhatsApp
2. Send a message to your connected WhatsApp number (Green API or Twilio)
3. Send: `Tomato 30 kg`
4. Optionally attach a photo of tomatoes
5. You should receive a confirmation with AI quality grade

### Test 3: View Product (Marketplace)

1. Open http://localhost:3001
2. You should see your product card with:
   - Product name and quantity
   - AI quality grade
   - Farmer details
3. The page auto-refreshes every 30 seconds

### Test 4: Place an Order (Buyer)

1. On the marketplace, click "Order Now" on a product
2. Fill in buyer details:
   - Name: Ravi Kumar
   - Phone: +919876543210
3. Click "Confirm Order"
4. The farmer should receive a WhatsApp notification instantly!

---

## 🔧 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
- Verify your connection string in `.env`
- Ensure password is correct (no special characters that need URL encoding)
- Check if IP is whitelisted in MongoDB Atlas Network Access

### Issue: WhatsApp Messages Not Received

**Solution:**
- If using Green API: Verify your instance is properly configured and connected
- If using Twilio: Verify you've joined the Twilio sandbox
- Check credentials in `.env`
- Ensure phone number format is correct

### Issue: Green API Authentication Failed

**Solution:**
- Double-check your Instance ID and Token
- Make sure you haven't copied extra spaces
- Regenerate the token in Green API dashboard if needed

---

## 🔄 Migration from Twilio to Green API

This project has been successfully migrated from Twilio to Green API for the following reasons:

1. **Better Reliability**: Green API offers more stable connections
2. **Enhanced Features**: Better media handling and message delivery
3. **Improved Documentation**: More comprehensive API documentation
4. **Cost-Effective**: Competitive pricing for WhatsApp integration

To migrate from Twilio to Green API:
1. Follow the [Green API Setup Guide](GREEN_API_SETUP.md)
2. Update your `.env` file with Green API credentials
3. Remove Twilio credentials from `.env`
4. Restart your application

---

## 📞 Support

If you encounter any issues:

1. Check server logs for error messages
2. Verify all environment variables are correctly set
3. Ensure your WhatsApp service (Green API or Twilio) is properly configured
4. Contact the respective support team for WhatsApp service issues

For FarmLink AI specific issues, please open a GitHub issue or contact the development team.