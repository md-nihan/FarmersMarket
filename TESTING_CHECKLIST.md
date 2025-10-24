# ✅ FarmLink AI - Testing Checklist

## Pre-Testing Setup

- [ ] MongoDB Atlas cluster created and running
- [ ] MongoDB connection string added to `.env`
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Python dependencies installed (`pip install -r requirements.txt`)

---

## 🚀 Service Startup Tests

### AI Service
- [ ] AI service starts without errors
- [ ] Console shows: "✅ Model loaded successfully!"
- [ ] Service running on http://localhost:5000
- [ ] Health check works: http://localhost:5000/health

### Backend Service
- [ ] Backend server starts without errors
- [ ] Console shows: "✅ MongoDB Connected Successfully"
- [ ] Service running on http://localhost:3001
- [ ] Health check works: http://localhost:3001/api/health
- [ ] Static files served: http://localhost:3001

---

## 🧑‍💼 Admin Panel Tests

### Farmer Management
- [ ] Admin panel loads: http://localhost:3001/admin.html
- [ ] UI displays correctly (glass morphism, gradients, animations)
- [ ] All 4 stat cards visible (Total Farmers, Active Farmers, Total Products, Orders)

### Add Farmer Functionality
- [ ] Fill farmer form with valid data
- [ ] Click "Add Farmer" button
- [ ] Success toast appears
- [ ] Farmer appears in farmers table
- [ ] Stats update correctly

### Edit Farmer Functionality
- [ ] Click "Edit" button on a farmer
- [ ] Modal opens with pre-filled data
- [ ] Modify farmer details
- [ ] Click "Save Changes"
- [ ] Success toast appears
- [ ] Table updates with new data

### Delete Farmer Functionality
- [ ] Click "Delete" button on a farmer
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Success toast appears
- [ ] Farmer removed from table
- [ ] Stats update correctly

---

## 🧑‍🌾 Farmer Dashboard Tests

### Farmer Registration
- [ ] Farmer added to system via admin panel
- [ ] Phone number includes country code (e.g., +91...)
- [ ] Farmer marked as Active

### Farmer Login
- [ ] Navigate to http://localhost:3001/farmer-login.html
- [ ] Enter valid farmer credentials
- [ ] Redirected to farmer dashboard
- [ ] Welcome message shows farmer name

### Product Upload - Text Only
- [ ] Fill product form with name and quantity
- [ ] Click "Upload Product"
- [ ] Success message received
- [ ] Product appears in "My Products" section
- [ ] Default quality grade assigned (Grade B)

### Product Upload - With Image
- [ ] Fill product form with name, quantity, and image
- [ ] Click "Upload Product"
- [ ] Success message received
- [ ] Product appears in "My Products" section
- [ ] AI quality grade assigned (A, B, or C)

### Invalid Form Handling
- [ ] Try to submit empty form
- [ ] Validation errors shown
- [ ] No product created in database

### Unregistered Farmer
- [ ] Try to login with unregistered credentials
- [ ] Error message shown
- [ ] No access to dashboard

---

## 🛒 Marketplace Tests

### Page Load
- [ ] Marketplace loads: http://localhost:3001
- [ ] Animated background displays (gradient orbs)
- [ ] Hero section shows title and stats
- [ ] Products section visible

### Product Display
- [ ] All available products load
- [ ] Each product card shows:
  - [ ] Product image (or placeholder)
  - [ ] Product name
  - [ ] Quantity
  - [ ] Quality grade badge (colored)
  - [ ] AI score (if available)
  - [ ] Farmer name
  - [ ] Farmer location
  - [ ] "Order Now" button
- [ ] Product count stat updates

### Filtering
- [ ] Click "All" filter - shows all products
- [ ] Click "Grade A" filter - shows only Grade A products
- [ ] Click "Grade B" filter - shows only Grade B products
- [ ] Active filter button highlighted

### Product Cards
- [ ] Hover over product card - scales up slightly
- [ ] Product image zooms on hover
- [ ] Grade badge has correct color:
  - [ ] Grade A: Blue gradient
  - [ ] Grade B: Pink gradient
  - [ ] Grade C: Orange gradient

### Auto-Refresh
- [ ] Wait 30 seconds
- [ ] Products refresh automatically
- [ ] New products appear without page reload

---

## 📦 Order Placement Tests

### Order Modal
- [ ] Click "Order Now" on a product
- [ ] Modal appears with glass effect
- [ ] Modal shows:
  - [ ] Product name
  - [ ] Quantity
  - [ ] Quality grade
  - [ ] Farmer details
- [ ] Form has fields for buyer name and phone

### Successful Order
- [ ] Fill in buyer name: "Ravi Kumar"
- [ ] Fill in buyer phone: "+919876543210"
- [ ] Click "Confirm Order"
- [ ] Button shows "Placing Order..." during processing
- [ ] Success toast appears
- [ ] Modal closes automatically
- [ ] Product status updates to "ordered"
- [ ] Product removed from marketplace (no longer available)

### Farmer Notification
- [ ] Farmer receives notification in dashboard
- [ ] Notification shows:
  - [ ] 🎉 Order Alert emoji
  - [ ] Product name
  - [ ] Quantity
  - [ ] Buyer name
  - [ ] Buyer phone number

### Order Validation
- [ ] Try to order without name - error shown
- [ ] Try to order without phone - error shown
- [ ] Try to order already ordered product - error shown

---

## 🤖 AI Quality Grading Tests

### Grade A Products
- [ ] Upload high-quality, clear produce image
- [ ] AI assigns Grade A
- [ ] Score is 80-100
- [ ] Badge displays with blue gradient

### Grade B Products
- [ ] Upload medium-quality produce image
- [ ] AI assigns Grade B
- [ ] Score is 60-80
- [ ] Badge displays with pink gradient

### Grade C Products
- [ ] Upload low-quality or unclear image
- [ ] AI assigns Grade C
- [ ] Score is below 60
- [ ] Badge displays with orange gradient

### No Image
- [ ] List product without image
- [ ] Default Grade B assigned
- [ ] Default score 75 assigned
- [ ] Product still appears on marketplace

### AI Service Failure
- [ ] Stop AI service (simulate failure)
- [ ] List product with image
- [ ] Default Grade B assigned (fallback)
- [ ] Product still created successfully

---

## 🎨 UI/UX Tests

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] All elements scale correctly
- [ ] No horizontal scrolling
- [ ] Touch-friendly buttons on mobile

### Animations
- [ ] Hero section fades in on load
- [ ] Stats animate (number counting)
- [ ] Product cards slide up on load
- [ ] Gradient orbs float smoothly
- [ ] Button hover effects work
- [ ] Modal slides up smoothly

### Visual Design
- [ ] Glass morphism effect visible
- [ ] Gradients render smoothly
- [ ] Colors match design (purple/pink theme)
- [ ] Text readable on all backgrounds
- [ ] Icons display correctly (emojis)

### Accessibility
- [ ] All form inputs have labels
- [ ] Buttons have clear text
- [ ] Error messages are clear
- [ ] Success messages visible
- [ ] Modal can be closed with X button

---

## 🔄 Data Persistence Tests

### Database Operations
- [ ] Add farmer - appears after page refresh
- [ ] List product - appears after page refresh
- [ ] Place order - status persists after refresh
- [ ] Edit farmer - changes persist
- [ ] Delete farmer - removal persists

### Data Integrity
- [ ] Farmer phone numbers unique
- [ ] Product IDs unique
- [ ] Timestamps accurate
- [ ] Status transitions valid (available → ordered)

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] Disconnect internet
- [ ] Try to load products - graceful error
- [ ] Try to place order - clear error message

### Invalid Data
- [ ] Submit empty forms - validation errors shown
- [ ] Enter invalid phone format - error shown
- [ ] Upload non-image file - handled gracefully

### Service Failures
- [ ] MongoDB disconnected - server shows error
- [ ] AI service down - fallback grade used
- [ ] Order still recorded

---

## 📊 Performance Tests

### Load Time
- [ ] Marketplace loads in < 2 seconds
- [ ] Admin panel loads in < 2 seconds
- [ ] Farmer dashboard loads in < 2 seconds
- [ ] API responses in < 500ms

### Image Handling
- [ ] Images load progressively
- [ ] Broken image URLs show placeholder
- [ ] Large images handled gracefully

### Multiple Users
- [ ] Multiple farmers can list products simultaneously
- [ ] Multiple buyers can view marketplace simultaneously
- [ ] Orders processed in sequence correctly

---

## 🎯 Success Criteria (MVP Goals)

### Objective 1: Farmer Empowerment
- [ ] 5 farmers onboarded (if testing with real users)
- [ ] 100% product listing success rate
- [ ] Listing takes < 60 seconds

### Objective 2: Buyer Engagement
- [ ] 10 orders placed successfully (if testing with real users)
- [ ] Every product has AI quality grade
- [ ] Zero failed transactions

---

## 📝 Bug Report Template

If you find issues, document them:

**Bug Title:** _Brief description_

**Steps to Reproduce:**
1. _Step 1_
2. _Step 2_
3. _Step 3_

**Expected Result:** _What should happen_

**Actual Result:** _What actually happened_

**Screenshots:** _If applicable_

**Browser/Device:** _Chrome, Firefox, Mobile, etc._

**Console Errors:** _Any errors in browser console or server logs_

---

## ✅ Final Checklist

Before demoing to stakeholders:

- [ ] All services running smoothly
- [ ] Sample data loaded (3-5 farmers, 10+ products)
- [ ] No console errors
- [ ] Mobile view tested
- [ ] Happy path tested end-to-end
- [ ] Demo script prepared
- [ ] Backup plan for live demo (screenshots/video)

---

**Testing completed? You're ready to launch! 🚀**