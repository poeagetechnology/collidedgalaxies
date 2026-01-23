# Shiprocket Checkout Integration - Architecture Diagrams

## 1. Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                         SHIPROCKET ECOSYSTEM                             │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

Phase 1: CATALOG SYNCHRONIZATION
═════════════════════════════════

Your Database (Firebase)
    │
    ├─ Products Collection
    ├─ Categories Collection
    └─ Inventory/Variants
    
    ↓ (Shiprocket pulls data via API)
    
┌─────────────────────────────────────┐
│   CATALOG SYNC ENDPOINTS            │
├─────────────────────────────────────┤
│ GET /shiprocket-catalog/products    │  ← Shiprocket periodically calls
│ GET /shiprocket-catalog/collections │  ← Shiprocket fetches categories
│ GET /shiprocket-catalog/products-by │  ← Shiprocket gets by collection
│         collection                  │
└─────────────────────────────────────┘
    
    ↓ (Data synced to Shiprocket)
    
Shiprocket Database (Product Catalog)
    ↓
Shiprocket Checkout UI (Shows your products)


Phase 2: REAL-TIME UPDATES (Webhooks)
════════════════════════════════════

Your Database Updated
    ↓
You Send Webhook (if implementing)
    
    ↓
┌─────────────────────────────────────┐
│   WEBHOOK ENDPOINTS                 │
├─────────────────────────────────────┤
│ POST /shiprocket-webhooks/product   │  ← Shiprocket notifies of updates
│ POST /shiprocket-webhooks/collection│  ← Category updates
└─────────────────────────────────────┘
    
    ↓
Your Database Updated (Real-time sync)


Phase 3: CUSTOMER CHECKOUT
══════════════════════════

Customer browses your website
    ↓
Adds items to cart
    ↓
Clicks "Checkout" button
    ↓
    
┌─────────────────────┐
│  Frontend           │
└─────────────────────┘
    │
    ├─ Collects item data
    ├─ Cart: [{variant_id, quantity}, ...]
    │
    ↓ POST /api/shiprocket-access-token
    
    ↓
┌─────────────────────┐
│  Backend (Your API) │
└─────────────────────┘
    │
    ├─ Validates request
    ├─ Generates HMAC signature
    ├─ Creates JSON payload
    │
    ↓ POST https://checkout-api.shiprocket.com/api/v1/access-token/checkout
    
    ↓
┌─────────────────────┐
│  Shiprocket API     │
└─────────────────────┘
    │
    ├─ Validates HMAC
    ├─ Creates checkout session
    ├─ Generates access token
    │
    ↓ Returns: { token, order_id, expires_in }
    
    ↓
┌─────────────────────┐
│  Backend (Your API) │
└─────────────────────┘
    │
    ↓ Returns token to frontend
    
    ↓
┌─────────────────────┐
│  Frontend           │
└─────────────────────┘
    │
    ├─ Loads Shiprocket SDK
    ├─ Opens checkout iframe with token
    │
    ↓
┌─────────────────────┐
│ Shiprocket Modal    │
│ (Checkout Page)     │
└─────────────────────┘
    │
    ├─ Shows products from your catalog
    ├─ Customer enters shipping address
    ├─ Customer selects payment method
    ├─ Customer completes payment
    │
    ↓ Payment processed
    
    ↓
Shiprocket generates order


Phase 4: ORDER CONFIRMATION
═══════════════════════════

Shiprocket triggers webhook
    ↓
    
POST /api/shiprocket/order-webhook
{
  order_id: "659fc40044f41a36bf1c556c",
  cart_data: { items: [...] },
  status: "SUCCESS",
  email: "customer@example.com",
  phone: "9999999999",
  payment_type: "PREPAID",
  total_amount_payable: 500.0
}
    
    ↓
┌─────────────────────┐
│  Backend (Your API) │
└─────────────────────┘
    │
    ├─ Validates webhook
    ├─ Stores order in Firebase
    ├─ TODO: Send confirmation email
    ├─ TODO: Update inventory
    ├─ TODO: Notify admin
    │
    ↓ Returns: { success: true }
    
    ↓
Your Database (Orders Collection)
    {
      shiprocket_order_id: "659fc40044f41a36bf1c556c",
      email: "customer@example.com",
      phone: "9999999999",
      status: "pending",
      payment_type: "PREPAID",
      total_amount: 500.0,
      created_at: timestamp,
      ...
    }
    
    ↓
┌─────────────────────┐
│  Frontend           │
└─────────────────────┘
    │
    ├─ Redirected to /success page
    ├─ Shows order confirmation
    ├─ Cart cleared
    │
    ↓
Customer receives confirmation email


Phase 5: ORDER MANAGEMENT (Optional)
════════════════════════════════════

Admin wants order details
    ↓
    
POST /api/shiprocket/order-details
{
  order_id: "659fc40044f41a36bf1c556c",
  timestamp: "2024-01-23T10:30:00.000Z"
}
    
    ↓
Backend calls Shiprocket API with HMAC
    ↓
Retrieves order status, tracking, etc.
    ↓
Returns to admin dashboard
```

---

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Checkout Page                             │
│         (app/(website)/checkout/page.tsx)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Tab 1: INFORMATION                                     │ │
│  │  • Email (from Auth)                                   │ │
│  │  • Shipping Address Form                               │ │
│  │  • Address Management                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Tab 2: SHIPPING                                        │ │
│  │  • Standard (Free) / Express (₹200)                    │ │
│  │  • Shipping Cost Calculation                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Tab 3: PAYMENT                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  ShiprocketCheckoutProper Component              │  │ │
│  │  │  (src/components/checkout/                       │  │ │
│  │  │   ShiprocketCheckoutProper.tsx)                  │  │ │
│  │  │                                                   │  │ │
│  │  │  • Loads Shiprocket SDK                          │  │ │
│  │  │  • Formats cart items (variant_id, qty)          │  │ │
│  │  │  • Calls /api/shiprocket-access-token            │  │ │
│  │  │  • Opens Shiprocket modal                        │  │ │
│  │  │  • Handles success/error callbacks               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Order Summary (Right Panel)                            │ │
│  │  • Cart Items List                                     │ │
│  │  • Subtotal                                            │ │
│  │  • Shipping Cost                                       │ │
│  │  • Total Amount                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. API Request/Response Flow

```
FRONTEND REQUEST
════════════════

Client Browser
    │
    ├─ Event: Click "Complete Purchase"
    │
    ↓ POST /api/shiprocket-access-token
    
Request Body:
{
  "cart_data": {
    "items": [
      {
        "variant_id": "product-123-red-m",
        "quantity": 2
      }
    ]
  },
  "redirect_url": "https://yourdomain.com/success",
  "timestamp": "2024-01-23T10:30:00.000Z"
}


BACKEND PROCESSING
═══════════════════

Received Request
    │
    ├─ Parse JSON
    ├─ Validate required fields
    │
    ↓ Generate HMAC
    
const payload = JSON.stringify({
  cart_data: request.cart_data,
  redirect_url: request.redirect_url,
  timestamp: request.timestamp
});

const hmac = crypto
  .createHmac('sha256', secretKey)
  .update(payload)
  .digest('base64');

    │
    ├─ HMAC: C3TMxIORicQUmJ70OYFCSqlXxTO1tADvFItwGp0kE60=
    │
    ↓ Call Shiprocket API
    
POST https://checkout-api.shiprocket.com/api/v1/access-token/checkout
Headers:
  Content-Type: application/json
  X-Api-Key: H3E8hebrr7oZFnVV
  X-Api-HMAC-SHA256: C3TMxIORicQUmJ70OYFCSqlXxTO1tADvFItwGp0kE60=

Body: {
  "cart_data": { "items": [...] },
  "redirect_url": "https://yourdomain.com/success",
  "timestamp": "2024-01-23T10:30:00.000Z"
}

    ↓
Response from Shiprocket:
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "order_id": "659fc40044f41a36bf1c556c",
    "expires_in": 3600
  }
}


BACKEND RESPONSE
════════════════

    ↓
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "order_id": "659fc40044f41a36bf1c556c",
  "expires_in": 3600
}

    ↓
Client Receives Token
    │
    ├─ Loads Shiprocket SDK
    ├─ Calls HeadlessCheckout.addToCart(event, token, {...})
    │
    ↓ Shiprocket Modal Opens
```

---

## 4. Database Schema (Firebase)

```
firestore/
│
├── products/
│   ├── product-123/
│   │   ├── title: "T-Shirt"
│   │   ├── description: "..."
│   │   ├── price: 499
│   │   ├── image: "https://..."
│   │   ├── sizes: ["S", "M", "L", "XL"]
│   │   ├── colors: [
│   │   │   { name: "Red", hex: "#FF0000" },
│   │   │   { name: "Blue", hex: "#0000FF" }
│   │   │ ]
│   │   ├── category: "tshirts"
│   │   ├── inventory: {
│   │   │   "Red": { "S": 10, "M": 20, "L": 15 },
│   │   │   "Blue": { "S": 5, "M": 10, "L": 8 }
│   │   │ }
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   └── product-124/
│       └── ...
│
├── categories/
│   ├── tshirts/
│   │   ├── name: "T-Shirts"
│   │   ├── description: "..."
│   │   ├── image: "https://..."
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   └── hoodies/
│       └── ...
│
└── orders/
    ├── order-1/
    │   ├── shiprocket_order_id: "659fc40044f41a36bf1c556c"
    │   ├── email: "customer@example.com"
    │   ├── phone: "9999999999"
    │   ├── payment_type: "PREPAID"
    │   ├── total_amount: 1000
    │   ├── status: "pending" (your internal status)
    │   ├── shiprocket_status: "SUCCESS"
    │   ├── cart_items: [
    │   │   {
    │   │     "variant_id": "product-123-red-m",
    │   │     "quantity": 2
    │   │   }
    │   │ ]
    │   ├── created_at: timestamp
    │   ├── updated_at: timestamp
    │   └── webhook_payload: { ... }
    │
    └── order-2/
        └── ...
```

---

## 5. Security Flow

```
REQUEST INTEGRITY & VALIDATION
══════════════════════════════

Frontend Sends Request
    │
    ├─ JSON Payload
    │
    ↓ Backend Receives
    
Backend Verifies:
    │
    ├─ 1. Required Headers Present?
    │   └─ X-Api-Key ✓
    │   └─ X-Api-HMAC-SHA256 ✓
    │
    ├─ 2. Parse Request Body
    │   └─ Extract JSON payload
    │
    ├─ 3. Recalculate HMAC
    │   ├─ Get Secret Key from env
    │   ├─ Apply HMAC-SHA256 algorithm
    │   ├─ Encode as Base64
    │   └─ Result: X-Api-HMAC-SHA256 (calculated)
    │
    ├─ 4. Compare HMAC Values
    │   ├─ Expected (from header): C3TMxIORicQUmJ70OYFCSqlXxTO1tADvFItwGp0kE60=
    │   ├─ Calculated: C3TMxIORicQUmJ70OYFCSqlXxTO1tADvFItwGp0kE60=
    │   └─ Match? ✓ YES → Process Request
    │          ✗ NO → Reject with 401 Unauthorized
    │
    ├─ 5. Validate Data
    │   ├─ Required fields present?
    │   ├─ Correct data types?
    │   └─ Within reasonable limits?
    │
    ├─ 6. Process Request
    │   └─ Call Shiprocket API
    │
    ↓
Response Sent
```

---

## 6. Order Webhook Security

```
SHIPROCKET SENDS ORDER WEBHOOK
══════════════════════════════

Shiprocket Server
    │
    ├─ Order placed successfully
    ├─ Payment confirmed
    │
    ↓ POST /api/shiprocket/order-webhook
    Headers:
      Content-Type: application/json
      (No HMAC header for order webhooks)

Request Body:
{
  "order_id": "659fc40044f41a36bf1c556c",
  "email": "customer@example.com",
  "phone": "9999999999",
  "status": "SUCCESS",
  "payment_type": "PREPAID",
  "total_amount_payable": 500.0,
  ...
}

    ↓
YOUR BACKEND
    │
    ├─ 1. Validate Request
    │   └─ Check required fields present
    │
    ├─ 2. Verify Status
    │   └─ status === "SUCCESS" ?
    │
    ├─ 3. Check for Duplicates
    │   └─ Query: order_id already exists?
    │
    ├─ 4. Store Order
    │   └─ Save to Firebase
    │
    ├─ 5. Send Confirmation
    │   ├─ Email to customer
    │   ├─ Notify admin
    │   ├─ Update inventory
    │   └─ Clear cart
    │
    ↓
Return 201 Created
{
  "status": "success",
  "message": "Order received and processed",
  "order_id": "659fc40044f41a36bf1c556c",
  "database_ref": "firestore-doc-id"
}
```

---

## 7. Error Handling Flow

```
REQUEST PROCESSING
═══════════════════

    ↓
Try Block
    │
    ├─ Parse Request ────→ ERROR? → 400 Bad Request
    │
    ├─ Validate Params ──→ ERROR? → 400 Bad Request
    │
    ├─ Get Credentials ──→ ERROR? → 500 Server Error
    │
    ├─ Generate HMAC ────→ ERROR? → 500 Server Error
    │
    ├─ Call API ─────────→ ERROR? → 503 Service Unavailable
    │
    ├─ Parse Response ───→ ERROR? → 502 Bad Gateway
    │
    └─ Return Success ───→ 200 OK
                          ↓
                     {success: true}

Catch Block (Unexpected Error)
    │
    └─ Return 500 Internal Server Error
       {error: "..."}


LOGGING OUTPUT
═════════════

[Shiprocket Checkout] Initiating checkout...
  ✅ Access token requested
  🔑 HMAC signature generated
  📡 Calling Shiprocket API...
  ✅ Token received: eyJhbGci...
  
OR

  ❌ API error: 401 Unauthorized
  Details: Invalid HMAC signature
```

---

This completes the architecture documentation for the Shiprocket Checkout integration!
