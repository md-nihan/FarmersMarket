# Changelog

All notable changes to the FarmLink AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Farmer authentication system (JWT-based)
- Farmer login and registration APIs
- Farmer dashboard with product upload functionality
- Order management system for farmers
- Customer-facing product listing API
- Order placement API for customers
- Customer order history functionality
- Admin order management features
- Real-time notifications using polling
- New Order model for tracking customer orders
- Farmer Login page (farmer-login.html)
- Farmer Dashboard page (farmer-dashboard.html)
- Farmer authentication routes (routes/farmerAuth.js)
- Farmer product management routes (routes/farmerProducts.js)
- Customer order routes (routes/customerOrders.js)
- Admin order management routes (routes/adminOrders.js)
- Order model (models/Order.js)
- Notification area in farmer dashboard for order alerts
- Quick action buttons on homepage for farmer registration and login
- AI freshness detection service (Python Flask microservice)
- TensorFlow-based computer vision model for produce quality grading
- REST API integration between Node.js backend and Python AI service

### Changed
- Updated Farmer model to include password field for authentication
- Updated Product model to include farmer_id reference
- Enhanced server.js to include new routes
- Enhanced admin.js to include order management functionality

### Fixed
- Image display issues after product upload
- Order placement errors due to field name mismatch (buyer_name -> customer_name)
- Missing notification area for farmers in dashboard
- Navigation improvements for farmer login and product upload
- Field name mismatch in order placement API (buyer_name/buyer_phone to customer_name/customer_phone)
- Image URL generation for uploaded products
- Order notification system for farmers
- Product image URLs not displaying correctly in marketplace
- Farmer dashboard notification system not working properly
- Image URL handling for both local development and production environments

### Removed
- All Twilio-related code and dependencies
- All Green API integration and references
- All WhatsApp messaging functionality
- Unnecessary test files and documentation
- Twilio sandbox references and setup instructions
- Unnecessary ngrok tunneling references
- Test pages not required for production (test-listing.html, image-test.html)
- Whilio test route and related package.json entries
- Green API test scripts and related files
- WhatsApp API integration for messaging

## [2025-10-24] - AI Freshness Detection Integration

### Added
- Python Flask microservice for AI freshness detection
- TensorFlow-based computer vision model for produce quality grading
- REST API integration between Node.js backend and Python AI service
- Automated quality grading system for uploaded produce images
- Freshness detection route (/api/freshness/check) for image analysis
- Quality grade assignment (Grade A/B/C) based on AI analysis
- Quality score (0-100) based on confidence levels
- Setup scripts for AI service (install-ai-dependencies.bat, start-ai-service.bat)
- Requirements file for Python dependencies (ai-service/requirements.txt)
- Documentation for AI service in README.md

### Changed
- Enhanced product upload workflow to include AI analysis
- Updated Product model to include quality_grade and quality_score fields
- Modified farmerProducts.js to integrate with AI service
- Improved README.md with AI service documentation

## [2025-10-24] - Enhanced Farmer Dashboard and Notification System

### Added
- Complete removal of all Green API/WhatsApp integration
- Customer location field in Order model
- Loading screen during farmer login
- Customer location and quantity fields in order form
- Loading animation after successful login

### Changed
- Updated farmer dashboard to show customer name and phone number clearly
- Improved status badge styling for better visibility
- Better order status update modal with guidance
- Improved error handling and user feedback
- Fixed HTML structure issues in order and product tables
- Enhanced button styles for better visibility
- Fixed white color issue in status guide
- Enhanced order display to show product quantity and farmer location
- Updated order form to collect customer location and quantity
- Enhanced login process with loading screen

### Removed
- All Green API/WhatsApp integration and references
- Unnecessary test files and documentation
- External messaging dependencies
- Notification system as requested
- Clear all options as requested
- DELETE endpoint for farmer products

## [2025-10-23] - Green API Migration Complete

### Added
- Complete migration from Twilio to WhatsApp API for all WhatsApp functionality
- Updated environment configuration to use WhatsApp API credentials
- Removed all Twilio-specific code and dependencies
- Enhanced WhatsApp message sending with media support via WhatsApp API
- Improved error handling for WhatsApp API integration

### Changed
- Replaced all Twilio message sending functions with WhatsApp API equivalents
- Updated farmer approval workflow to use WhatsApp API for welcome messages
- Modified product listing confirmation to use WhatsApp API
- Updated order notification system to use WhatsApp API
- Refactored WhatsApp webhook to handle WhatsApp API payload structure (supports caption text, and media URL fields downloadUrl|urlFile|fileUrl|url)
- Updated all route files to import WhatsApp API messaging functions

### Fixed
- WhatsApp messaging reliability issues by switching to WhatsApp API
- Media file handling for product images via WhatsApp
- Phone number formatting for international compatibility
- Message delivery confirmation and error reporting

### Migration Notes
- All Twilio environment variables have been replaced with WhatsApp API equivalents
- Twilio-specific code has been completely removed
- WhatsApp API credentials are now required in environment configuration
- WhatsApp webhook URL remains the same but handles WhatsApp API payload format
- All existing functionality preserved with improved reliability

## [2025-10-23] - WhatsApp API Integration Complete

### Added
- Complete migration from Twilio to WhatsApp API for all WhatsApp functionality
- Updated environment configuration to use WhatsApp API credentials
- Removed all Twilio-specific code and dependencies
- Enhanced WhatsApp message sending with media support via WhatsApp API
- Improved error handling for WhatsApp API integration

### Changed
- Replaced all Twilio message sending functions with WhatsApp API equivalents
- Updated farmer approval workflow to use WhatsApp API for welcome messages
- Modified product listing confirmation to use WhatsApp API
- Updated order notification system to use WhatsApp API
- Refactored WhatsApp webhook to handle WhatsApp API payload structure (supports caption text, and media URL fields downloadUrl|urlFile|fileUrl|url)
- Updated all route files to import WhatsApp API messaging functions

### Fixed
- WhatsApp messaging reliability issues by switching to WhatsApp API
- Media file handling for product images via WhatsApp
- Phone number formatting for international compatibility
- Message delivery confirmation and error reporting

### Migration Notes
- All Twilio environment variables have been replaced with WhatsApp API equivalents
- Twilio-specific code has been completely removed
- WhatsApp API credentials are now required in environment configuration
- WhatsApp webhook URL remains the same but handles WhatsApp API payload format
- All existing functionality preserved with improved reliability

## [2025-10-23] - WhatsApp inbound not replying (fast fix + plan captured)

User report: After verification on WhatsApp, no "Congratulations" or "Product Listed" replies when sending messages like "Banana 50kg"; products not appearing on website.

Actions executed fast:
- Added webhook alias so both `POST /api/whatsapp` (primary) and `POST /whatsapp` (alias) are handled by the same router. This catches common Twilio Console misconfiguration and restores inbound processing immediately.
- Left existing `/api/whatsapp/test` health route for quick verification.

Operator steps to verify now:
1. In Twilio Console → WhatsApp Sandbox, set "When a message comes in" to:
   - https://<your-domain>/api/whatsapp  (preferred) or
   - https://<your-domain>/whatsapp      (now also accepted)
   Method: POST.
2. Send a WhatsApp message: `Banana 50kg`.
   - Expected immediate reply with confirmation.
   - Product should appear on marketplace homepage.
3. If still no reply, check server logs for `📱 WhatsApp Message from` and Twilio delivery logs.

Notes:
- No schema changes. Safe deploy.
- This entry documents the conversation-driven fix and plan.

### Fixed
- Image display issue on mobile devices
- WhatsApp image URLs pointing to localhost instead of production URL
- Product API returning incorrect image URLs for mobile clients
- Server URL detection logic for production environment
- WhatsApp messaging not working for other numbers (Twilio env vars missing)
- Farmer registration welcome messages not being sent
- Order notification messages not being sent to farmers
- Phone number formatting issues in WhatsApp messages
- Improved error handling and logging for Twilio messages
- Twilio client initialization issue in farmer approval process
- Fixed WhatsApp messaging system to properly send approval messages
- Added lazy initialization of Twilio clients inside message sender to avoid race conditions
- Ensure order notification route initializes Twilio clients if needed

### Changed
- Updated WhatsApp webhook to generate correct production URLs
- Modified products API to fix image URLs at runtime
- Enhanced server configuration for better URL handling
- Improved error handling for image URL generation
- Updated farmers.js to use WhatsApp failover system
- Enhanced Twilio client initialization with better logging
- Improved error messages for missing Twilio configuration
- Added phone normalization (E.164) and WhatsApp address enforcement to reduce delivery failures

## [2025-10-23] - Messaging Reliability Improvements

### Added
- Phone normalization and WhatsApp address utilities (`utils/phone.js`) enforcing E.164 and `whatsapp:+` format
- Lazy initialization of messaging clients when first sending a message
- Normalization of sender number to `whatsapp:+E.164` during client setup
- `.gitignore` rule to exclude `public/uploads/`

### Fixed
- Welcome WhatsApp after admin approval not delivering (number normalization + messaging init)
- Order notification WhatsApp not delivering (ensured init + strict formatting)
- Delivery failures due to inconsistent phone formats across flows

### Changed
- `routes/farmers.js`: normalize phone on registration/update; approval uses enforced `whatsapp:+E.164`
- `routes/products.js`: uses `ensureWhatsAppAddress` for notifications
- `routes/whatsapp.js`: enforces proper `from` and `to` formats; keeps lazy client init

### Verification
- `/api/test-whatsapp` OK (multi-account ready)
- `test-farmer-messaging.js` approval flow sends welcome WhatsApp
- `test-order-notification.js` + placing order triggers WhatsApp notification
- `/api/health` OK

### Operational Notes (conversation summary)
- Report: farmers not receiving welcome/order WhatsApps; images previously fixed
- Actions: implemented normalization, enforced formats, ensured messaging init, updated docs and .gitignore
- Added late-welcome delivery on first inbound WhatsApp from approved farmer and surfaced join instructions to admin UI after approval
- If still no delivery in production: verify env vars `WHATSAPP_API_ID_INSTANCE`, `WHATSAPP_API_TOKEN_INSTANCE`, `BACKEND_PUBLIC_URL`, `DEFAULT_COUNTRY_CODE`; re-approve/update farmers to normalize phones; share server logs around "Sending welcome message" for error codes

## [2025-10-23] - Image Display Fix

### Fixed
- **Critical Bug**: Images uploaded via WhatsApp were not displaying on mobile devices
- **Root Cause**: Image URLs were generated using `http://localhost:3001` instead of production URL
- **Solution**: Updated all URL generation logic to use `https://farmlinkai-7.onrender.com`
- **Impact**: All existing and new images now display correctly on all devices

### Technical Changes
- Modified `routes/whatsapp.js` to generate correct production URLs
- Updated `routes/products.js` to fix image URLs at runtime
- Enhanced `server.js` URL detection logic
- Added fallback URL handling for production environment

### Verification
- ✅ All 8 existing products now have correct image URLs
- ✅ Images are accessible via HTTPS (HTTP 200 status)
- ✅ Mobile devices can now properly load and display images
- ✅ New WhatsApp uploads automatically use correct URLs

---

## [Previous Changes]

### Initial Setup
- WhatsApp integration for farmer product listing
- AI-powered quality grading system
- Mobile-responsive marketplace interface
- Admin panel for farmer management
- WhatsApp API integration for messaging
- MongoDB database integration
- Render deployment configuration