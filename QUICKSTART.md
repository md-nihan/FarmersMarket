# 🌾 FarmLink AI - Quick Start Guide

## Get Started in 5 Minutes!

### 1️⃣ Install Dependencies

```powershell
# Install Node.js packages
npm install

# Install Python packages
cd ai-service
pip install -r requirements.txt
cd ..
```

### 2️⃣ Configure Environment

```powershell
# Copy example environment file
Copy-Item .env.example .env

# Edit .env with your credentials
notepad .env
```

**Required Credentials:**
- MongoDB Atlas connection string

### 3️⃣ Start Services

**Terminal 1 - AI Service:**
```powershell
cd ai-service
python app.py
```

**Terminal 2 - Backend Server:**
```powershell
npm start
```

### 4️⃣ Access Platform

- 🛒 **Marketplace:** http://localhost:3001
- 👨‍💼 **Admin Panel:** http://localhost:3001/admin.html
- 🧑‍🌾 **Farmer Login:** http://localhost:3001/farmer-login.html
- 🏥 **Health Check:** http://localhost:3001/api/health

---

## 🎯 Quick Test Workflow

1. **Add Farmer** (Admin Panel)
   - Open http://localhost:3001/admin.html
   - Add farmer

2. **Farmer Login**
   - Go to http://localhost:3001/farmer-login.html
   - Login with farmer credentials

3. **List Product** (Farmer Dashboard)
   - Upload product with image
   - Product appears on marketplace

4. **View Product** (Marketplace)
   - Open http://localhost:3001
   - See your AI-graded product

5. **Place Order** (Buyer)
   - Click "Order Now"
   - Fill details
   - Farmer gets notification in dashboard

---

## 📚 Full Documentation

For detailed setup instructions, troubleshooting, and API reference:
👉 See **SETUP_GUIDE.md**

---

## 🎨 Tech Stack

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** Vanilla JS, Modern CSS (Glass Morphism)
- **AI:** Python, Flask, TensorFlow (MobileNetV2)

---

## 🏆 MVP Features

✅ Farmer dashboard product listing
✅ AI quality grading (Grade A/B/C)
✅ Real-time marketplace
✅ Order placement system
✅ In-website notifications
✅ Admin farmer management

---

## 🚀 Next Steps

After MVP validation:
- Payment gateway integration
- Route optimization for delivery
- Demand forecasting AI
- Mobile application
- Production deployment

---

**Made with ❤️ for farmers** 🧑‍🌾