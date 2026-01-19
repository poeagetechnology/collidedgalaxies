# Shiprocket Integration Guide

## Setup Instructions

### 1. Add Your Shiprocket Credentials to `.env`

Replace the placeholders with your actual Shiprocket credentials:

```
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
```

### 2. API Endpoints Created

#### `/api/shiprocket-auth` (POST)
- Authenticates with Shiprocket and generates a bearer token
- No request body needed
- Returns: `{ token: string, expires_in: number }`

#### `/api/shiprocket-create-order` (POST)
- Creates an order in Shiprocket using the auth token
- Request body:
```json
{
  "token": "auth-token",
  "order_id": "ORDER-unique-id",
  "product": {
    "name": "Product Name",
    "sku": "product-id",
    "price": 450,
    "quantity": 1
  },
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "9999999999",
    "address": "House 123",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "pickup_location": "Default"
}
```
- Returns: `{ success: true, order_id: string, shipment_id: string }`

### 3. Updated Features

#### Product Details Page
- **"SHIP WITH SHIPROCKET" button** now:
  1. Requires user to be logged in
  2. Fetches customer data from Firestore (name, email, phone, address)
  3. Creates order on Shiprocket
  4. Redirects to success page

#### Product Card
- **"Ship with Shiprocket" button** redirects to product details with checkout intent

### 4. Flow Diagram

```
User clicks Shiprocket button
    ↓
User logged in? → No → Show login modal
    ↓ Yes
Get customer data from Firestore
    ↓
Call /api/shiprocket-auth → Get auth token
    ↓
Call /api/shiprocket-create-order → Create order
    ↓
Redirect to /success?order_id=XXX&payment_gateway=shiprocket
```

### 5. Utilities Used

- **`createShiprocketOrder(product, customer, pickupLocation)`**
  - Handles authentication and order creation
  - Located in: `src/utils/shiprocket-order.utils.ts`
  - Returns: `{ order_id, shipment_id }`

### 6. Error Handling

All endpoints include comprehensive error logging:
- Authentication failures
- Missing credentials
- API errors from Shiprocket
- Network errors

Check server logs (where Next.js dev server runs) for detailed debug info with 🚀, ✅, ❌ emojis.

### 7. Testing

1. Update `.env` with your actual Shiprocket credentials
2. Click "SHIP WITH SHIPROCKET" button on any product
3. Log in if needed
4. Order should be created and you'll be redirected to success page

### 8. Notes

- Requires user to be logged in (customer data needed)
- Uses customer's default address from Firestore
- Default pickup location is "Default" (update in code as needed)
- Orders are created as COD (Cash on Delivery)
- Each order gets unique ID: `ORDER-{productId}-{timestamp}`
