# 🚀 FarmLink AI - Green API Setup Guide

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- ✅ **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- ✅ **MongoDB Atlas Account** (Free) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- ✅ **Green API Account** (Free trial) - [Sign up here](https://green-api.com/)

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

### Step 2: Green API WhatsApp Setup

1. **Create a Green API account:**
   - Go to [Green API](https://green-api.com/)
   - Sign up for a free account
   - Complete email verification

2. **Create a WhatsApp instance:**
   - Log in to your Green API dashboard
   - Click "Create instance"
   - Choose a name for your instance (e.g., "FarmLink AI")
   - Select "WhatsApp" as the platform
   - Click "Create"

3. **Configure your WhatsApp instance:**
   - Once created, you'll see your instance details
   - Note down the following information:
     - **Instance ID**: (e.g., `7107354839`)
     - **Instance Token**: (long string of characters)
   - Scan the QR code with your WhatsApp mobile app to connect your phone number

4. **Set up webhook URL:**
   - In your instance settings, find the "Webhook URL" field
   - Set it to: `https://your-domain.com/api/whatsapp` (replace with your actual domain)
   - For local development, you can use ngrok to expose your localhost
   - Set webhook mode to "yes"
   - Set webhook token (optional but recommended)

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

   # Green API WhatsApp Configuration
   GREEN_API_URL=https://7107.api.green-api.com
   GREEN_API_MEDIA_URL=https://7107.api.green-api.com
   GREEN_API_ID_INSTANCE=7107354839
   GREEN_API_TOKEN_INSTANCE=your_instance_token_here

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
2. Send a message to your connected Green API number
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
- Verify your Green API instance is properly configured and connected
- Check GREEN_API_ID_INSTANCE and GREEN_API_TOKEN_INSTANCE in `.env`
- Ensure your webhook URL is correctly set in Green API dashboard
- Check server logs for any error messages

### Issue: Green API Authentication Failed

**Solution:**
- Double-check your Instance ID and Token
- Make sure you haven't copied extra spaces
- Regenerate the token in Green API dashboard if needed

---

## 🌐 Production Deployment

For production deployment:

1. Update `BACKEND_PUBLIC_URL` in `.env` to your production domain
2. Ensure your webhook URL in Green API dashboard points to your production domain
3. Set `NODE_ENV=production` in `.env`
4. Deploy to your preferred hosting platform (Render, Heroku, etc.)

---

## 📞 Support

If you encounter any issues:

1. Check server logs for error messages
2. Verify all environment variables are correctly set
3. Ensure your Green API instance is active and properly connected
4. Contact Green API support if issues are related to their service

For FarmLink AI specific issues, please open a GitHub issue or contact the development team.