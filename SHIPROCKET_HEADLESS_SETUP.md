# Shiprocket Headless Checkout Integration

## Overview

This project now uses **Shiprocket's Headless Checkout SDK** for all payment processing. The old Cashfree and multi-payment flows have been completely removed and replaced with a streamlined Shiprocket-only checkout.

## Key Changes

### 1. **Removed Components & Logic**
- ❌ Old `ShiprocketCheckoutButton.tsx` (using REST API)
- ❌ Cashfree payment integration
- ❌ COD (Cash on Delivery) payment flow
- ❌ Multiple payment method selection UI
- ❌ Coupon system

### 2. **New Components**

#### `ShiprocketHeadlessCheckout.tsx`
A React component that handles the Shiprocket headless checkout modal integration.

**Features:**
- Automatically loads Shiprocket Checkout SDK
- Opens secure iframe/modal for payment
- Handles success, cancel, and error callbacks
- Supports all Shiprocket payment methods (UPI, Cards, BNPL, Wallets, etc.)

**Usage:**
```jsx
<ShiprocketHeadlessCheckout
  cartItems={cartItems}
  onSuccess={handleSuccess}
  onError={handleError}
  onCancel={handleCancel}
  buttonText="Pay with Shiprocket"
/>
```

### 3. **New Utilities**

#### `shiprocket-headless.utils.ts`
Helper functions for Shiprocket integration:
- `formatCartItemsForShiprocket()` - Format cart data
- `calculateTotalAmount()` - Calculate totals
- `createShiprocketOrderBackend()` - Backend order creation
- `processShiprocketPayment()` - Handle payment webhooks

## Setup Instructions

### Step 1: Get Your Shiprocket Seller ID

1. Log in to [Shiprocket Dashboard](https://dashboard.shiprocket.in/)
2. Go to **Settings → Integrations → Shiprocket Checkout**
3. Copy your **Seller ID**

### Step 2: Add Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_SHIPROCKET_SELLER_ID=your_seller_id_here
SHIPROCKET_EMAIL=your_email@example.com
SHIPROCKET_PASSWORD=your_password
```

### Step 3: Verify API Routes

These API routes are used for backend operations:
- `/api/shiprocket-auth` - Get authentication token
- `/api/shiprocket-create-order` - Create order in Shiprocket
- `/api/shiprocket-order-webhook` - Handle payment webhooks

### Step 4: Update Success Page

The success page should handle:
```typescript
// Check for Shiprocket payment gateway
const paymentGateway = searchParams.get('payment_gateway');
const orderId = searchParams.get('order_id');

if (paymentGateway === 'shiprocket') {
  // Handle Shiprocket success
  console.log('Order ID:', orderId);
}
```

## Checkout Flow

### User Flow:
1. **Product Page** → Click "Buy Now"
   - Select size and color
   - Redirects to checkout with direct buy data

2. **Checkout Page** 
   - **Tab 1: Information** - Enter shipping address
   - **Tab 2: Shipping** - Select shipping method (Standard/Express)
   - **Tab 3: Payment** - Opens Shiprocket modal

3. **Shiprocket Modal**
   - User selects payment method
   - Enters payment details
   - Completes payment

4. **Success Page**
   - Order confirmation
   - Clears cart
   - Removes session storage data

## Payment Methods Supported by Shiprocket

✅ UPI (Google Pay, PhonePe, PayTM, etc.)
✅ Credit/Debit Cards
✅ Net Banking
✅ Digital Wallets
✅ BNPL (Buy Now Pay Later)
✅ And more...

## Cart Integration

### From Product Page (Buy Now):
```typescript
const directBuyData = {
  productId: product.id,
  productTitle: product.title,
  price: product.price,
  quantity: quantity,
  size: selectedSize,
  color: selectedColor,
  image: productImage
};
sessionStorage.setItem('directBuyData', JSON.stringify(directBuyData));
```

### From Shopping Cart:
```typescript
// Cart items automatically pass to checkout
const cartItems = useCart().cartItems;
// Pass to ShiprocketHeadlessCheckout component
```

## Data Structure

### Cart Item Format:
```typescript
{
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}
```

### Checkout Address Format:
```typescript
{
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  address: string;
  city: string;
  postalCode: string;
  mobileNumber: string;
}
```

## Error Handling

The component handles common errors:
- Script not loaded → Shows loading state
- Empty cart → Disables button
- Payment failures → Toast notification + error callback
- User cancellation → Cancel callback

## Webhooks

Shiprocket sends webhooks to handle:
- Payment success
- Payment failure
- Order updates
- Shipment tracking

Setup webhook URL in Shiprocket dashboard:
```
https://yourdomain.com/api/shiprocket-order-webhook
```

## Success Page Handling

After successful payment, user is redirected to:
```
/success?payment_gateway=shiprocket&order_id=SHIPROCKET_ORDER_ID
```

The success page should:
1. Display order confirmation
2. Show order details
3. Clear localStorage/sessionStorage
4. Provide order tracking link

## Important Notes

⚠️ **Seller ID is Public**: `NEXT_PUBLIC_SHIPROCKET_SELLER_ID` is exposed in frontend (intentional for SDK)
⚠️ **API Credentials are Private**: Keep `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` secret
⚠️ **Testing**: Use Shiprocket's test credentials before going live
⚠️ **Pricing**: Verify Shiprocket charges with their current pricing model

## Troubleshooting

### Checkout Modal Doesn't Open
- Check if `NEXT_PUBLIC_SHIPROCKET_SELLER_ID` is set
- Check browser console for errors
- Verify script loaded: `window.ShiprocketCheckout` should exist

### Order Creation Fails
- Verify Shiprocket credentials in `.env.local`
- Check API rate limits
- Ensure proper request formatting

### Payments Not Processing
- Verify Shiprocket account is active
- Check merchant approval status
- Verify amount calculations

## Support

For issues with Shiprocket:
- [Shiprocket Documentation](https://www.shiprocket.in/shipRocketDocs/)
- [Shiprocket Support](https://support.shiprocket.in/)

For issues with this integration:
- Check browser console for errors
- Review network requests in DevTools
- Check Firebase logs for address/user data issues
