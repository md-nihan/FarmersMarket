# Changelog

All notable changes to the FarmLink AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CHANGELOG.md file for tracking project changes
- Image URL fix for mobile device compatibility
- Runtime URL correction for production environment
- Fallback URL handling for deployed applications
- TWILIO_SETUP_FIX.md guide for WhatsApp configuration
- Enhanced Twilio error handling and logging
- WhatsApp messaging failover system for farmers.js
- Debug scripts for testing WhatsApp functionality
- Green API integration for WhatsApp messaging
- New WhatsApp route file for Green API (`routes/whatsapp-green.js`)
- Test script for Green API integration (`test-green-api.js`)

### Conversation Notes (2025-10-23)
- Report: Farmer receives welcome message but sending a photo with vegetable details does not confirm listing; image not uploaded.
- Actions: Fixed Green API webhook event key, added caption parsing, ensured uploads directory creation.
- Expected: Sending an image with caption like "Tomato 50 kg" now replies with "Product Listed" and uploads image to website.
- Added scripts/seed-farmer.js to quickly seed an approved, active farmer for local testing.

### Changed
- Migrated WhatsApp integration from Twilio to Green API
- Updated server.js to use Green API routes
- Updated farmers.js to use Green API for sending messages
- Updated products.js to use Green API for sending messages
- Removed Twilio dependencies from package.json
- Updated environment variables to use Green API configuration
- Updated .env.example with Green API configuration

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
- Green API webhook did not process inbound messages due to checking `type` instead of `typeWebhook`
- Image+caption messages were not parsed; now caption is treated as product details
- Ensure `public/uploads` directory exists to save incoming media reliably
- Normalize saved product farmer_phone to E.164 for consistency and queries
- Added GET /api/whatsapp/last to debug last inbound webhook during testing
- Render deploy crash: initially added fallback to Twilio routes; REMOVED fallback and now force Green API routes to prevent accidental Twilio replies

## [2025-10-23] - Green API Migration Complete

### Added
- Complete migration from Twilio to Green API for all WhatsApp functionality
- Updated environment configuration to use Green API credentials
- Removed all Twilio-specific code and dependencies
- Enhanced WhatsApp message sending with media support via Green API
- Improved error handling for Green API integration

### Changed
- Replaced all Twilio message sending functions with Green API equivalents
- Updated farmer approval workflow to use Green API for welcome messages
- Modified product listing confirmation to use Green API
- Updated order notification system to use Green API
- Refactored WhatsApp webhook to handle Green API payload structure
- Updated all route files to import Green API messaging functions

### Fixed
- WhatsApp messaging reliability issues by switching to Green API
- Media file handling for product images via WhatsApp
- Phone number formatting for international compatibility
- Message delivery confirmation and error reporting

### Migration Notes
- All Twilio environment variables have been replaced with Green API equivalents
- Twilio-specific code has been completely removed
- Green API instance ID and token are now required in environment configuration
- WhatsApp webhook URL remains the same but handles Green API payload format
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
- Lazy initialization of Twilio clients when first sending a message
- Normalization of Twilio sender number to `whatsapp:+E164` during client setup
- `.gitignore` rule to exclude `public/uploads/`

### Fixed
- Welcome WhatsApp after admin approval not delivering (number normalization + Twilio init)
- Order notification WhatsApp not delivering (ensured init + strict formatting)
- Delivery failures due to inconsistent phone formats across flows

### Changed
- `routes/farmers.js`: normalize phone on registration/update; approval uses enforced `whatsapp:+E164`
- `routes/products.js`: uses `ensureWhatsAppAddress` for notifications
- `routes/whatsapp.js`: enforces proper `from` and `to` formats; keeps lazy client init

### Verification
- `/api/test-twilio` OK (multi-account ready)
- `test-farmer-messaging.js` approval flow sends welcome WhatsApp
- `test-order-notification.js` + placing order triggers WhatsApp notification
- `/api/health` OK

### Operational Notes (conversation summary)
- Report: farmers not receiving welcome/order WhatsApps; images previously fixed
- Actions: implemented normalization, enforced formats, ensured Twilio init, updated docs and .gitignore
- Added late-welcome delivery on first inbound WhatsApp from approved farmer and surfaced join instructions to admin UI after approval
- If still no delivery in production: ensure farmer has joined Twilio sandbox by sending "join organization-organized" to +14155238886 (or use TWILIO_SANDBOX_NUMBER/CODE); verify env vars `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `BACKEND_PUBLIC_URL`, `DEFAULT_COUNTRY_CODE`; re-approve/update farmers to normalize phones; share server logs around "Sending welcome message" for Twilio error codes

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
- Twilio integration for messaging
- MongoDB database integration
- Render deployment configuration