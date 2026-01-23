# 🎯 Debug Checklist - Where to Look for Errors

## Console Logs Location

### 1. Browser Console (Press F12)
- Click **Console** tab
- Filter by typing: `[Shiprocket`
- Shows all frontend logs

```
📚 [Shiprocket SDK] STEP 0: Loading SDK
🚀 [Shiprocket Checkout] STEP 1: Starting checkout
🛒 [Shiprocket Checkout] STEP 2: Formatting items
📦 [Shiprocket Checkout] STEP 3: Preparing request
🔑 [Shiprocket Checkout] STEP 4: Calling API
📥 [Shiprocket Checkout] STEP 5: Parsing response
🎯 [Shiprocket Checkout] STEP 6: Checking SDK
🛒 [Shiprocket Checkout] STEP 7: Opening modal
```

### 2. Server Terminal (where npm run dev is running)
- Look for logs starting with `[Shiprocket`
- Shows all backend logs

```
🚀 [Shiprocket] Received token request
🔑 [Shiprocket] Credentials check
📦 [Shiprocket] Request body
📡 [Shiprocket] Making API call
📨 [Shiprocket] API response status
✅ [Shiprocket] Received data
```

---

## Step-by-Step Debugging

### Step 1: SDK Loading
**Look for:**
```
✅ [Shiprocket SDK] Script loaded successfully
window.HeadlessCheckout available: function
HeadlessCheckout methods: [...]
```

**If not found:**
- SDK failed to load
- Check internet connection
- Check browser console for errors
- Try clearing browser cache

---

### Step 2: Cart Items
**Look for:**
```
✅ [Shiprocket Checkout] Cart items validated: X items
Raw cart items: [...]
```

**If "Cart is empty":**
- No items in cartItems array
- Check Cart context
- Verify items are being added

---

### Step 3: Request Formatting
**Look for:**
```
✅ [Shiprocket Checkout] Formatted items: [...]
📋 Request Payload: {...}
```

**Issues to look for:**
- Wrong `variant_id` format
- Missing `quantity`
- Invalid `redirect_url`

---

### Step 4: API Call
**Look for (Server Console):**
```
🚀 [Shiprocket] Received token request
🔑 [Shiprocket] Credentials check: {
  hasApiKey: true,
  hasSecretKey: true
}
```

**If credentials missing:**
- `.env.local` not set
- Server not restarted
- Typo in env variable name

---

### Step 5: API Response
**Look for:**
```
📨 [Shiprocket] API response status: 200
✅ [Shiprocket] Received data: {...}
```

**Response Status Meanings:**
- **200** ✅ Success
- **400** ❌ Bad request (check payload)
- **401** ❌ Unauthorized (check credentials)
- **422** ❌ Invalid data (check env vars)
- **500** ❌ Server error (check logs)
- **503** ❌ Service down (Shiprocket API issue)

---

### Step 6: Token Extraction
**Look for:**
```
✅ [Shiprocket Checkout] Token received
Token (first 20 chars): eyJhbGciOiJIUzI1NiI...
Order ID: 659fc40044f41a36bf1c556c
```

**If token missing:**
- Backend response format wrong
- Check API response in server logs
- Verify Shiprocket API working

---

### Step 7: SDK Methods
**Look for:**
```
window.HeadlessCheckout: function
window.HeadlessCheckout.addToCart: function
✅ [Shiprocket Checkout] SDK methods available
```

**If methods missing:**
- SDK didn't load properly
- Try page refresh
- Check browser console for load errors

---

### Step 8: Modal Opens
**Look for:**
```
✅ [Shiprocket Checkout] Checkout modal opened successfully
✨ CHECKOUT PROCESS COMPLETED SUCCESSFULLY ✨
```

**If modal doesn't open:**
- SDK methods not available
- Token invalid
- Browser popup blocked
- Check browser console

---

## Error Responses

### ❌ 422 Error
```
Response Status: 422
Error Response Body: {...}
❌ [Shiprocket Checkout] API returned error status: 422
```

**Causes & Fixes:**
1. Missing environment variables → Add to `.env.local`
2. Wrong API credentials → Verify from Shiprocket dashboard
3. Invalid payload → Check JSON format
4. HMAC signature error → Check SECRET_KEY

**What to check:**
- ✅ SHIPROCKET_SECRET_KEY is correct
- ✅ NEXT_PUBLIC_SHIPROCKET_API_KEY is valid
- ✅ Restart dev server after env changes
- ✅ Server logs show HMAC verification

---

### ❌ SDK Not Loading
```
❌ [Shiprocket SDK] Failed to load
```

**Causes & Fixes:**
1. Network issue → Check internet
2. CDN blocked → Check browser console
3. Ads/script blocker → Disable extensions
4. CORS error → Check browser console

**What to check:**
- ✅ Network tab in DevTools
- ✅ No CORS errors
- ✅ CDN URL accessible
- ✅ Browser console errors

---

### ❌ No Token in Response
```
❌ [Shiprocket Checkout] No token in response
```

**Causes & Fixes:**
1. Backend error → Check server logs
2. API returned error → Look for HTTP status
3. Invalid credentials → Verify env variables
4. Payload format wrong → Check request body

**What to check:**
- ✅ Server console for errors
- ✅ API response status code
- ✅ Environment variables
- ✅ Shiprocket API availability

---

## Quick Debug Session

### For Users Reporting Issues:

1. **Restart Dev Server**
   ```bash
   # Stop: Ctrl+C
   # Clear
   rm -rf .next
   # Restart
   npm run dev
   ```

2. **Open Browser Console** (F12)

3. **Try Checkout Again**

4. **Copy ALL logs starting with `[Shiprocket`**

5. **Share the logs with:**
   - Full console output
   - Server terminal output
   - Error message shown to user

---

## Environment Variables Verification

### In Browser Console:
```javascript
console.log({
  apiKey: process.env.NEXT_PUBLIC_SHIPROCKET_API_KEY?.substring(0, 10) + '...',
  sellerId: process.env.NEXT_PUBLIC_SHIPROCKET_SELLER_ID,
  hasSecret: !!process.env.SHIPROCKET_SECRET_KEY
})
```

### Expected Output:
```javascript
{
  apiKey: "H3E8hebrr7...",
  sellerId: "25617008",
  hasSecret: true
}
```

### If any are missing:
1. Check `.env.local` file
2. Verify variable names exactly
3. Restart dev server
4. Clear browser cache

---

## Common Issues & Solutions

| Issue | Look For | Fix |
|-------|----------|-----|
| SDK won't load | `❌ [Shiprocket SDK] Failed to load` | Check internet, disable extensions |
| Cart empty | `❌ Cart is empty` | Add items to cart |
| 422 error | `Response Status: 422` | Verify `.env.local` variables |
| No token | `❌ No token in response` | Check server console logs |
| Modal won't open | `❌ SDK not properly initialized` | Refresh page, check SDK load |
| Missing credentials | `hasApiKey: false` | Add to `.env.local`, restart server |

---

## How to Help Yourself Debug

### Question 1: Where does SDK loading fail?
- Browser Console → Search for `[Shiprocket SDK]`
- Look for ✅ or ❌

### Question 2: Which API call failed?
- Server Console → Search for `[Shiprocket]`
- Look for response status code

### Question 3: What was wrong with the response?
- Server Console → Look for error details
- Browser Console → Look for parsing errors

### Question 4: Why won't modal open?
- Browser Console → Look for STEP 6 & 7
- Verify SDK available and token present

---

## Summary

**Console logging is now COMPREHENSIVE:**
- ✅ 8 detailed steps tracked
- ✅ All errors logged with full context
- ✅ Easy to identify failure point
- ✅ Structured log format for readability

**You can now:**
1. See exactly where checkout fails
2. Understand what went wrong
3. Know what to fix
4. Debug in minutes instead of hours

**Next Step:** Test the checkout and look for the logs!
