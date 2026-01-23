# 🔍 Shiprocket Checkout - Detailed Debug Logging Guide

## How to View Logs

### Browser Console (F12)
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Filter logs:
   - Type in search: `[Shiprocket`
   - Shows all related logs

### Server Console (Terminal)
1. Look at your **npm run dev** terminal
2. Shows backend API logs
3. Filter for: `[Shiprocket`

---

## Expected Log Flow (Success Path)

### ✅ Phase 1: SDK Loading
```
═══════════════════════════════════════════════════════════
📚 [Shiprocket SDK] STEP 0: Loading Shiprocket SDK
═══════════════════════════════════════════════════════════
Script URL: https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js
Script async: true
✅ [Shiprocket SDK] Script loaded successfully
window.HeadlessCheckout available: function
HeadlessCheckout methods: [...]
✅ [Shiprocket SDK] Script tag appended to document head
```

**If SDK fails:**
- ❌ "Failed to load script"
- Check: Internet connection
- Check: CDN is accessible
- Check: No CORS errors

---

### ✅ Phase 2: User Clicks "Pay"
```
═══════════════════════════════════════════════════════════
🚀 [Shiprocket Checkout] STEP 1: Starting checkout process
═══════════════════════════════════════════════════════════
✅ [Shiprocket Checkout] Cart items validated: 2 items
✅ [Shiprocket Checkout] SDK loaded successfully
```

**If cart validation fails:**
- ❌ "Cart is empty"
- Check: `cartItems.length` > 0
- Check: Items are being passed correctly

---

### ✅ Phase 3: Format Cart Items
```
═══════════════════════════════════════════════════════════
🛒 [Shiprocket Checkout] STEP 2: Formatting cart items
═══════════════════════════════════════════════════════════
Raw cart items: [
  {
    id: "product-123",
    title: "T-Shirt",
    price: 499,
    quantity: 1,
    size: "M",
    color: "Red"
  }
]
  Item "T-Shirt": {
    variant_id: "product-123-red-m",
    quantity: 1
  }
✅ [Shiprocket Checkout] Formatted items: [...]
```

**If formatting fails:**
- Check: `variant_id` format
- Check: `quantity` is a number
- Check: No missing fields

---

### ✅ Phase 4: Prepare Request
```
═══════════════════════════════════════════════════════════
📦 [Shiprocket Checkout] STEP 3: Preparing API request
═══════════════════════════════════════════════════════════
Redirect URL: http://localhost:3000/success?payment_gateway=shiprocket
Timestamp: 2024-01-23T10:30:45.123Z
📋 Request Payload: {
  "cart_data": {
    "items": [...]
  },
  "redirect_url": "...",
  "timestamp": "..."
}
```

**If request preparation fails:**
- Check: `redirect_url` is valid
- Check: `timestamp` is ISO format
- Check: payload structure matches spec

---

### ✅ Phase 5: Call Backend API
```
═══════════════════════════════════════════════════════════
🔑 [Shiprocket Checkout] STEP 4: Calling /api/shiprocket-access-token
═══════════════════════════════════════════════════════════
POST /api/shiprocket-access-token
Response Status: 200
Response Headers: {Content-Type: application/json, ...}
✅ [Shiprocket Checkout] Token API call successful
```

**If API call fails:**
- Response Status: 400 (Bad Request)
  - Check: Request payload format
  - Check: Required fields present
  
- Response Status: 401 (Unauthorized)
  - Check: API credentials
  - Check: HMAC signature
  
- Response Status: 422 (Unprocessable Entity)
  - Check: Environment variables
  - Check: Backend configuration
  
- Response Status: 500 (Server Error)
  - Check: Backend error logs
  - Check: Shiprocket API availability
  
- Response Status: 503 (Service Unavailable)
  - Check: Shiprocket API is down
  - Check: Network connectivity

---

### Backend API Logs (Server Console)
```
🚀 [Shiprocket] Received token request
🔑 [Shiprocket] Credentials check: {
  hasApiKey: true,
  hasSecretKey: true,
  baseUrl: "https://checkout-api.shiprocket.com"
}
📦 [Shiprocket] Request body: {...}
📝 [Shiprocket] Payload string: {...}
✅ [Shiprocket] HMAC generated: C3TMxIORicQUm...
📡 [Shiprocket] Making API call to: https://checkout-api.shiprocket.com/api/v1/access-token/checkout
📡 [Shiprocket] Request Headers: {
  X-Api-Key: H3E8h...,
  X-Api-HMAC-SHA256: C3TMx...
}
📨 [Shiprocket] API response status: 200
✅ [Shiprocket] Received data: {
  "data": {
    "token": "eyJhbGc...",
    "order_id": "659fc40...",
    "expires_in": 3600
  }
}
✅ [Shiprocket] Returning token: eyJhbGc...
```

---

### ✅ Phase 6: Parse Response
```
═══════════════════════════════════════════════════════════
📥 [Shiprocket Checkout] STEP 5: Parsing token response
═══════════════════════════════════════════════════════════
Response Data: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "order_id": "659fc40044f41a36bf1c556c",
  "expires_in": 3600
}
✅ [Shiprocket Checkout] Token received
Token (first 20 chars): eyJhbGciOiJIUzI1NiI...
Order ID: 659fc40044f41a36bf1c556c
Expires In: 3600
```

**If parsing fails:**
- ❌ "No token in response"
- Check: Backend returned token
- Check: Response format matches spec
- Check: Token field exists

---

### ✅ Phase 7: Check SDK
```
═══════════════════════════════════════════════════════════
🎯 [Shiprocket Checkout] STEP 6: Checking Shiprocket SDK
═══════════════════════════════════════════════════════════
window.HeadlessCheckout: function
window.HeadlessCheckout.addToCart: function
✅ [Shiprocket Checkout] SDK methods available
```

**If SDK check fails:**
- ❌ "SDK not properly initialized"
- Available methods: {...}
- Check: SDK loaded successfully
- Check: Methods available in window

---

### ✅ Phase 8: Open Modal
```
═══════════════════════════════════════════════════════════
🛒 [Shiprocket Checkout] STEP 7: Opening checkout modal
═══════════════════════════════════════════════════════════
Created click event: Event {...}
✅ [Shiprocket Checkout] Checkout modal opened successfully
═══════════════════════════════════════════════════════════
✨ CHECKOUT PROCESS COMPLETED SUCCESSFULLY ✨
═══════════════════════════════════════════════════════════
```

**If modal fails to open:**
- Check: SDK methods available
- Check: Token is valid
- Check: Browser supports modal
- Check: No JavaScript errors

---

## Error Scenarios & Debugging

### Scenario 1: 422 Error
```
Response Status: 422
Error Response Body: {...details...}
❌ [Shiprocket Checkout] API returned error status: 422
```

**What to check:**
1. Check `.env.local` has all variables
2. Verify `SHIPROCKET_SECRET_KEY` is correct
3. Check server console for HMAC errors
4. Verify `NEXT_PUBLIC_SHIPROCKET_API_KEY` validity

---

### Scenario 2: SDK Load Fails
```
❌ [Shiprocket SDK] Failed to load script
Script src: https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js
Script loaded property: false
```

**What to check:**
1. Internet connection
2. CDN accessibility
3. Browser extensions blocking scripts
4. Check network tab in DevTools

---

### Scenario 3: Token Not in Response
```
❌ [Shiprocket Checkout] No token in response
Response: {success: false, error: "..."}
```

**What to check:**
1. Backend error logs
2. API credentials validity
3. Payload format correctness
4. Shiprocket API status

---

### Scenario 4: Missing Cart Items
```
❌ [Shiprocket Checkout] Cart is empty
```

**What to check:**
1. Items added to cart
2. Component receives `cartItems` prop
3. `cartItems` is an array
4. Array has length > 0

---

## How to Share Logs

When reporting issues, share:

1. **Browser Console** (F12 → Console):
   - Copy all `[Shiprocket` logs
   - Include any red ❌ errors

2. **Server Console** (Terminal):
   - Copy all `[Shiprocket` logs
   - Include any API responses

3. **Environment Check**:
   ```javascript
   // Paste in browser console:
   console.log('API Key:', process.env.NEXT_PUBLIC_SHIPROCKET_API_KEY)
   console.log('Seller ID:', process.env.NEXT_PUBLIC_SHIPROCKET_SELLER_ID)
   console.log('Has Secret Key:', !!process.env.SHIPROCKET_SECRET_KEY)
   ```

---

## Quick Debugging Commands

### Browser Console (F12)
```javascript
// Check SDK
console.log('SDK Loaded:', typeof window.HeadlessCheckout)

// Check environment
console.log('Config:', {
  apiKey: process.env.NEXT_PUBLIC_SHIPROCKET_API_KEY,
  sellerId: process.env.NEXT_PUBLIC_SHIPROCKET_SELLER_ID
})

// Test API call
fetch('/api/shiprocket-access-token', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    cart_data: {items: [{variant_id: 'test-1', quantity: 1}]},
    redirect_url: window.location.origin + '/success',
    timestamp: new Date().toISOString()
  })
}).then(r => r.json()).then(d => console.log('Response:', d))
```

---

## Summary

With these detailed logs, you can identify exactly where the error occurs:

1. **SDK Loading** → Check SDK script
2. **Cart Validation** → Check cart items
3. **Request Preparation** → Check payload format
4. **API Call** → Check credentials & response status
5. **Response Parsing** → Check token presence
6. **Modal Opening** → Check SDK availability

**Look for lines starting with:**
- ✅ = Success steps
- ❌ = Error steps
- 🚀 = Starting phase
- 📡 = API call
- 🎯 = Checkpoint

All logs are timestamped and structured to make debugging easy!
