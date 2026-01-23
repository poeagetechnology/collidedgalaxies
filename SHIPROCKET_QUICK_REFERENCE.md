# 🚀 Shiprocket Integration - Quick Reference

## 📝 API Endpoints Quick Lookup

### Catalog Endpoints (Called BY Shiprocket)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/shiprocket-catalog/products` | GET | All products (paginated) |
| `/api/shiprocket-catalog/collections` | GET | All categories (paginated) |
| `/api/shiprocket-catalog/products-by-collection` | GET | Products in category |

### Webhook Endpoints (Called BY Shiprocket after sync)
| Endpoint | Method | Trigger |
|----------|--------|---------|
| `/api/shiprocket-webhooks/product` | POST | Product/variant updated |
| `/api/shiprocket-webhooks/collection` | POST | Collection/category updated |
| `/api/shiprocket/order-webhook` | POST | Order placed (after payment) |

### Checkout Endpoints (Called BY Frontend)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/shiprocket-access-token` | POST | Generate checkout token |
| `/api/shiprocket/order-details` | POST | Get order info by ID |

---

## ⚙️ Environment Variables

```env
# Required - Get from Shiprocket Dashboard
NEXT_PUBLIC_SHIPROCKET_API_KEY=your_api_key
NEXT_PUBLIC_SHIPROCKET_SELLER_ID=your_seller_id
SHIPROCKET_SECRET_KEY=your_secret_key

# Optional - For REST API (if needed)
SHIPROCKET_EMAIL=your_email@example.com
SHIPROCKET_PASSWORD=your_password
```

---

## 📦 Using in Components

### Simple Checkout Button
```tsx
import ShiprocketCheckoutProper from '@/src/components/checkout/ShiprocketCheckoutProper';

<ShiprocketCheckoutProper
  cartItems={cartItems}
  onSuccess={() => console.log('Order placed!')}
/>
```

---

## 🧪 Quick Test Commands

### Test Products Endpoint
```bash
curl "http://localhost:3000/api/shiprocket-catalog/products?page=1&limit=5"
```

### Test Collections Endpoint
```bash
curl "http://localhost:3000/api/shiprocket-catalog/collections?page=1&limit=5"
```

### Generate Token
```bash
curl -X POST "http://localhost:3000/api/shiprocket-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "cart_data": {"items": [{"variant_id": "product-1-red-m", "quantity": 1}]},
    "redirect_url": "http://localhost:3000/success",
    "timestamp": "2024-01-23T10:30:00.000Z"
  }'
```

### Test Order Webhook
```bash
curl -X POST "http://localhost:3000/api/shiprocket/order-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test-123",
    "email": "user@example.com",
    "phone": "9999999999",
    "status": "SUCCESS",
    "payment_type": "PREPAID",
    "total_amount_payable": 500
  }'
```

---

## 🔑 HMAC Signature Verification

All requests include HMAC for security:

```typescript
import crypto from 'crypto';

// Calculate HMAC
const hmac = crypto
  .createHmac('sha256', secretKey)
  .update(jsonPayload)
  .digest('base64');

// Add to headers
headers['X-Api-HMAC-SHA256'] = hmac;
```

---

## 📍 Endpoints to Register with Shiprocket

Contact Shiprocket support and register these URLs:

```
Catalog Endpoints:
• https://yourdomain.com/api/shiprocket-catalog/products
• https://yourdomain.com/api/shiprocket-catalog/collections
• https://yourdomain.com/api/shiprocket-catalog/products-by-collection

Webhook Endpoints:
• https://yourdomain.com/api/shiprocket-webhooks/product
• https://yourdomain.com/api/shiprocket-webhooks/collection
• https://yourdomain.com/api/shiprocket/order-webhook
```

---

## 🎯 Integration Checklist

- [ ] Environment variables configured
- [ ] Catalog endpoints tested locally
- [ ] Access token generation tested
- [ ] Order webhook tested
- [ ] Endpoints registered with Shiprocket
- [ ] Production deployment done
- [ ] Webhook URLs updated to production
- [ ] End-to-end checkout tested

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Missing credentials" | Check `.env.local` has all variables |
| "HMAC verification failed" | Verify Secret Key is exact (no spaces) |
| "Order not created" | Check order webhook status & logs |
| "Checkout modal won't open" | Check browser console for SDK errors |
| "Products not syncing" | Verify catalog endpoints are public |

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `SHIPROCKET_PROPER_INTEGRATION.md` | Complete setup guide |
| `SHIPROCKET_IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `.env.shiprocket.example` | Environment variables template |
| `src/components/checkout/ShiprocketCheckoutProper.tsx` | Checkout component |
| `app/api/shiprocket-catalog/*` | Catalog sync APIs |
| `app/api/shiprocket-webhooks/*` | Webhook handlers |
| `app/api/shiprocket/order-webhook` | Order receipt handler |

---

## 🔗 References

- **Official Docs**: https://documenter.getpostman.com/view/25617008/2sB34bL3ig
- **HMAC Tool**: https://www.devglan.com/online-tools/hmac-sha256-online
- **Shiprocket Dashboard**: https://dashboard.shiprocket.in/
- **Support**: support@shiprocket.in

---

**Status**: ✅ All endpoints implemented and documented
**Last Updated**: January 23, 2026
