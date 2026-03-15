#!/usr/bin/env node

/**
 * QUICK START: Grant Admin Access
 * 
 * FOR THE EMAIL: www.7339596165@gmail.com
 * 
 * ===== STEP 1: Get Firebase Service Account =====
 * 
 * 1. Go to: https://console.firebase.google.com
 * 2. Select your project
 * 3. Go to: Project Settings (gear icon) → Service Accounts tab
 * 4. Click "Generate Private Key" button
 * 5. Save the downloaded file as "firebase-service-account.json" 
 *    in the project root folder (same level as package.json)
 * 
 * ===== STEP 2: Run the Script =====
 * 
 * Open terminal in project root and run:
 * 
 *   node scripts/grant-admin-access.js www.7339596165@gmail.com
 * 
 * ===== STEP 3: Verify =====
 * 
 * Go to admin panel at: /admin/admins
 * You should see the user with "admin" role
 * 
 * ===== TROUBLESHOOTING =====
 * 
 * If you get "Cannot find module 'firebase-admin'" error:
 *   npm install firebase-admin
 * 
 * If you get "Cannot find module 'firebase-service-account.json'" error:
 *   Make sure the JSON file is in the project root (same folder as package.json)
 * 
 * If you get "No user found with email" error:
 *   - The user might not be registered yet
 *   - Check if email is spelled correctly
 *   - Check admin panel to see all registered users
 * 
 * ===== ALTERNATIVE: Use Admin Panel =====
 * 
 * If you already have admin access:
 * 1. Go to /admin/admins page
 * 2. Find the user in the list
 * 3. Click "Make Admin" button
 * 
 * ===== API ENDPOINT =====
 * 
 * You can also use the HTTP API:
 * 
 *   POST /api/admin/grant-admin-access
 *   Content-Type: application/json
 * 
 *   { "email": "www.7339596165@gmail.com" }
 * 
 * Using curl:
 * 
 *   curl -X POST http://localhost:3000/api/admin/grant-admin-access \
 *     -H "Content-Type: application/json" \
 *     -d "{\"email\":\"www.7339596165@gmail.com\"}"
 * 
 */

console.log(require('fs').readFileSync(__filename, 'utf8'));
