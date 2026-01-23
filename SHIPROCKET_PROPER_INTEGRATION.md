# Shiprocket Checkout API Integration - Complete Guide

> ⭐ **Official Shiprocket Documentation**: https://documenter.getpostman.com/view/25617008/2sB34bL3ig

## 🎯 Overview

This guide implements the **proper Shiprocket Checkout API** integration as per their official documentation. The integration includes:

- ✅ Catalog Sync APIs (Products, Collections)
- ✅ Real-time Catalog Webhooks
- ✅ Access Token Generation (Headless Checkout)
- ✅ Order Reception via Webhooks
- ✅ Order Details API
- ✅ Proper Authentication with HMAC signatures

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [API Endpoints](#api-endpoints)
3. [Setup Instructions](#setup-instructions)
4. [Testing Checklist](#testing-checklist)
5. [Production Deployment](#production-deployment)

---

## 🚀 Getting Started

### Step 1: Get Shiprocket API Credentials

1. Log in to [Shiprocket Dashboard](https://dashboard.shiprocket.in/)
2. Navigate to **Settings → Integrations**
3. Find **Shiprocket Checkout** section
4. Copy and save:
   - API Key
   - Secret Key
   - Seller ID

### Step 2: Configure Environment Variables

Create `.env.local` with:

```env
# Public credentials (safe for frontend)
NEXT_PUBLIC_SHIPROCKET_API_KEY=your_api_key
NEXT_PUBLIC_SHIPROCKET_SELLER_ID=your_seller_id
NEXT_PUBLIC_SHIPROCKET_BASE_URL=https://checkout-api.shiprocket.com

# Secret credentials (backend only)
SHIPROCKET_SECRET_KEY=your_secret_key
SHIPROCKET_EMAIL=your_email@example.com
SHIPROCKET_PASSWORD=your_password
```

See `.env.shiprocket.example` for complete reference.

### Step 3: Register Catalog & Webhook Endpoints with Shiprocket

Contact Shiprocket support and provide:

| Type | URL | Purpose |
|------|-----|---------|
| Catalog - Products | `https://yourdomain.com/api/shiprocket-catalog/products?page=1&limit=100` | Sync all products |
| Catalog - Collections | `https://yourdomain.com/api/shiprocket-catalog/collections?page=1&limit=100` | Sync all categories |
| Catalog - By Collection | `https://yourdomain.com/api/shiprocket-catalog/products-by-collection?collection_id={ID}` | Sync by category |
| Webhook - Products | `https://yourdomain.com/api/shiprocket-webhooks/product` | Product updates |
| Webhook - Collections | `https://yourdomain.com/api/shiprocket-webhooks/collection` | Collection updates |
| Webhook - Orders | `https://yourdomain.com/api/shiprocket/order-webhook` | Order placement |

---

## 🔌 API Endpoints

### 1. Catalog Sync APIs

These APIs are called by Shiprocket to fetch your product catalog.

#### Fetch All Products
```http
GET /api/shiprocket-catalog/products?page=1&limit=100
```

**Response:**
```json
{
  "status": "success",
  "page": 1,
  "limit": 100,
  "total": 245,
  "data": [
    {
      "id": "product-123",
      "title": "T-Shirt",
      "body_html": "Premium cotton t-shirt",
      "vendor": "Collided Galaxies",
      "product_type": "Apparel",
      "updated_at": "2024-01-23T10:30:00Z",
      "status": "active",
      "variants": [
        {
          "id": "product-123-red-m",
          "title": "Red - M",
          "price": "499.00",
          "quantity": 50,
          "sku": "TSHIRT-RED-M",
          "image": { "src": "https://..." },
          "weight": 0.5
        }
      ],
      "image": { "src": "https://..." }
    }
  ]
}
```

#### Fetch Collections
```http
GET /api/shiprocket-catalog/collections?page=1&limit=100
```

#### Fetch Products by Collection
```http
GET /api/shiprocket-catalog/products-by-collection?collection_id=cats&page=1&limit=100
```

---

### 2. Catalog Update Webhooks

Shiprocket sends product/collection updates to these endpoints.

#### Product Update Webhook
```http
POST /api/shiprocket-webhooks/product
X-Api-Key: YOUR_API_KEY
X-Api-HMAC-SHA256: <hmac_signature>

{
  "id": 632910392,
  "title": "IPod Nano - 8GB",
  "body_html": "<p>Description</p>",
  "vendor": "Apple",
  "product_type": "Cult Products",
  "updated_at": "2023-11-07T09:50:12Z",
  "status": "active",
  "variants": [
    {
      "id": "808950810",
      "title": "Pink",
      "price": "199.00",
      "quantity": 10,
      "sku": "IPOD2008PINK"
    }
  ]
}
```

---

### 3. Access Token Generation (Checkout Initiation)

Called by frontend before checkout to generate authentication token.

```http
POST /api/shiprocket-access-token
Content-Type: application/json

{
  "cart_data": {
    "items": [
      {
        "variant_id": "product-123-red-m",
        "quantity": 2
      }
    ]
  },
  "redirect_url": "https://yourdomain.com/success?payment_gateway=shiprocket",
  "timestamp": "2024-01-23T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "order_id": "659fc40044f41a36bf1c556c",
  "expires_in": 3600
}
```

---

### 4. Order Webhook (Post-Purchase)

Shiprocket sends order details after successful payment.

```http
POST /api/shiprocket/order-webhook
Content-Type: application/json

{
  "order_id": "659fc40044f41a36bf1c556c",
  "cart_data": {
    "items": [
      {
        "variant_id": "product-123-red-m",
        "quantity": 2
      }
    ]
  },
  "status": "SUCCESS",
  "phone": "9999999999",
  "email": "customer@example.com",
  "payment_type": "PREPAID",
  "total_amount_payable": 1000.0,
  "payment_method": "UPI",
  "payment_status": "completed"
}
```

---

### 5. Order Details API

Fetch order information by order ID.

```http
POST /api/shiprocket/order-details
Content-Type: application/json

{
  "order_id": "659fc40044f41a36bf1c556c",
  "timestamp": "2024-01-23T10:30:00.000Z"
}
```

---

## 🛒 Checkout Flow

### Frontend Component (ShiprocketCheckoutProper.tsx)

```tsx
import ShiprocketCheckoutProper from '@/src/components/checkout/ShiprocketCheckoutProper';

export default function CheckoutPage() {
  const { cartItems } = useCart();
  
  return (
    <ShiprocketCheckoutProper
      cartItems={cartItems}
      onSuccess={(response) => {
        console.log('Order placed:', response);
        // Redirect to success page
      }}
      onError={(error) => {
        console.error('Checkout failed:', error);
      }}
      buttonText="Complete Purchase"
    />
  );
}
```

### Complete Checkout Flow

```
1. User adds products to cart
   ↓
2. Clicks "Checkout" button
   ↓
3. Frontend calls /api/shiprocket-access-token
   ↓
4. Backend generates HMAC, calls Shiprocket API
   ↓
5. Shiprocket returns access token
   ↓
6. Frontend loads Shiprocket SDK with token
   ↓
7. Shiprocket opens checkout iframe
   ↓
8. User selects payment method & completes payment
   ↓
9. Shiprocket sends order webhook to /api/shiprocket/order-webhook
   ↓
10. Backend stores order in Firebase
   ↓
11. User redirected to success page
```

---

## ✅ Testing Checklist

### Test Locally

- [ ] Environment variables configured in `.env.local`
- [ ] Catalog endpoints return products correctly
- [ ] Access token generation works
- [ ] Shiprocket SDK loads in browser
- [ ] Checkout modal opens on button click
- [ ] Test payment (use Shiprocket test credentials)

### Integration Testing

- [ ] Catalog endpoints registered with Shiprocket
- [ ] Product webhook receives updates
- [ ] Collection webhook receives updates
- [ ] Order webhook receives order data
- [ ] Orders stored in Firebase correctly
- [ ] Success page displays order confirmation

### Before Production

- [ ] All environment variables set in hosting platform
- [ ] HTTPS enabled for all endpoints
- [ ] Webhook URLs pointing to production domain
- [ ] Error handling and logging in place
- [ ] Monitor logs for authentication errors
- [ ] Test end-to-end checkout

---

## 🔐 Security Considerations

### HMAC Signature Verification

All requests must include HMAC signature in header:

```typescript
// Generate HMAC
const hmac = crypto
  .createHmac('sha256', secretKey)
  .update(payloadString)
  .digest('base64');

// Include in request headers
headers['X-Api-HMAC-SHA256'] = hmac;
```

### Best Practices

1. ✅ **Store Secret Key securely** - Never expose to frontend
2. ✅ **Validate all webhooks** - Verify HMAC signatures
3. ✅ **Use HTTPS** - All API calls must be encrypted
4. ✅ **Rate limiting** - Implement to prevent abuse
5. ✅ **Audit logs** - Log all payment transactions
6. ✅ **PCI compliance** - Never store sensitive payment data

---

## 📦 Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SHIPROCKET_API_KEY`
   - `NEXT_PUBLIC_SHIPROCKET_SELLER_ID`
   - `SHIPROCKET_SECRET_KEY`
   - `SHIPROCKET_EMAIL`
   - `SHIPROCKET_PASSWORD`

2. Update webhook URLs in Shiprocket dashboard to production domain

3. Test end-to-end checkout

### Docker Deployment

```dockerfile
ENV NEXT_PUBLIC_SHIPROCKET_API_KEY=your_key
ENV SHIPROCKET_SECRET_KEY=your_secret
```

---

## 🐛 Troubleshooting

### "Failed to generate access token"
- Check API Key and Secret Key are correct
- Verify timestamp is in ISO 8601 format
- Ensure HMAC signature is Base64 encoded

### "HMAC verification failed"
- Verify Secret Key is exactly correct (no extra spaces)
- Check payload format matches specification
- Ensure timestamp format is correct

### "Order not created"
- Check order webhook is receiving requests
- Verify Firebase connection
- Check server logs for detailed errors

### "Checkout modal not opening"
- Verify Shiprocket SDK loaded successfully
- Check browser console for errors
- Ensure token is valid and not expired

---

## 📚 Resources

- **Shiprocket API Docs**: https://documenter.getpostman.com/view/25617008/2sB34bL3ig
- **Postman Collection**: Import from documentation link
- **HMAC Tool**: https://www.devglan.com/online-tools/hmac-sha256-online
- **Support**: support@shiprocket.in

---

## ✨ Summary

Your Shiprocket Checkout integration is now complete with:

- ✅ Catalog synchronization APIs
- ✅ Real-time product/collection webhooks  
- ✅ Secure checkout token generation
- ✅ Order reception and storage
- ✅ Proper HMAC authentication
- ✅ Production-ready error handling

**Next Steps**: Contact Shiprocket to register your catalog endpoints and webhooks!
