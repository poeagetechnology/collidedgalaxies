# Bundle Offers Implementation Guide

## Overview

Bundle Offers is a new feature that allows you to create attractive product bundles with discounted bundle prices. Customers can purchase multiple products at a reduced combined price, and bundles are displayed throughout the website.

---

## 📁 File Structure

### Backend Files

#### Data Models

- **[src/server/models/bundle.model.ts](src/server/models/bundle.model.ts)** - Bundle TypeScript interfaces and types
  - `Bundle` - Core bundle interface with all properties
  - `BundleFormData` - Form data for creating/updating bundles
  - `BundleProduct` - Product within a bundle
  - `BundleWithProductDetails` - Bundle with enriched product details

#### Services

- **[src/server/services/bundle.service.ts](src/server/services/bundle.service.ts)** - Firebase Firestore operations
  - `subscribeToBundles()` - Real-time subscription to active bundles
  - `subscribeToAllBundles()` - Real-time subscription to all bundles
  - `addBundleAdmin()` - Create new bundle
  - `updateBundleAdmin()` - Update existing bundle
  - `deleteBundleAdmin()` - Delete bundle
  - `getBundlesForAdmin()` - Fetch all bundles for admin panel

#### API Routes

- **[app/api/admin/bundles/route.ts](app/api/admin/bundles/route.ts)** - Admin API endpoints
  - `GET /api/admin/bundles` - Fetch all bundles (admin)
  - `POST /api/admin/bundles` - Create new bundle (admin)
  - `PUT /api/admin/bundles?id=bundleId` - Update bundle (admin)
  - `DELETE /api/admin/bundles?id=bundleId` - Delete bundle (admin)

- **[app/api/bundles/route.ts](app/api/bundles/route.ts)** - Public API endpoints
  - `GET /api/bundles` - Fetch active bundles (public)

### Admin Panel Files

- **[app/admin/bundles/page.tsx](app/admin/bundles/page.tsx)** - Main bundles management page
- **[src/components/admin/bundles/bundleTable.tsx](src/components/admin/bundles/bundleTable.tsx)** - Bundle list table
- **[src/components/admin/bundles/bundleModal.tsx](src/components/admin/bundles/bundleModal.tsx)** - Bundle creation/edit modal form

### Frontend Components

- **[src/components/bundles/bundleCard.tsx](src/components/bundles/bundleCard.tsx)** - Individual bundle card display
- **[src/components/bundles/bundleSection.tsx](src/components/bundles/bundleSection.tsx)** - Bundle section container

### Updated Files

- **[app/(website)/page.tsx](<app/(website)/page.tsx>)** - Homepage (added BundleSection)
- **[app/(website)/products/productsPageNew.tsx](<app/(website)/products/productsPageNew.tsx>)** - Products page (added BundleSection)
- **[src/server/utils/constants.ts](src/server/utils/constants.ts)** - Admin sidebar menu (added Bundle Offers link)

---

## 🚀 How to Use

### Creating a Bundle (Admin Panel)

1. **Navigate to Admin Panel**
   - Go to `/admin/bundles`
   - Click "Create Bundle" button

2. **Fill in Bundle Information**
   - **Bundle Name** (required) - e.g., "Summer Collection Bundle"
   - **Description** - Describe what's in the bundle
   - **Original Total Price** - Auto-calculated sum of selected products
   - **Bundle Price** (required) - The discounted price customer pays
   - **Active** - Check to make bundle visible on frontend

3. **Select Products**
   - Check products you want to include in the bundle
   - Set quantity for each product (default: 1)
   - Adjust quantities as needed

4. **Review Pricing Summary**
   - Check the discount percentage and savings amount
   - Ensure bundle price is lower than original total

5. **Save Bundle**
   - Click "Create Bundle" to save
   - View on homepage and products page immediately

### Editing a Bundle

1. Go to `/admin/bundles`
2. Click the **Edit** icon on desired bundle
3. Modify any fields (name, products, prices, etc.)
4. Click "Update Bundle" to save changes

### Deleting a Bundle

1. Go to `/admin/bundles`
2. Click the **Delete** icon on desired bundle
3. Confirm deletion in the popup
4. Bundle is removed immediately

---

## 📊 Bundle Data Structure

```typescript
{
  id: string;                        // Unique bundle ID (auto-generated)
  name: string;                      // Bundle title
  description?: string;              // Optional description
  products: BundleProduct[];         // Array of products in bundle
  originalTotalPrice: number;        // Sum of individual prices
  bundlePrice: number;               // Discounted bundle price
  discount?: number;                 // Discount amount/percentage
  image?: string;                    // Main bundle image URL
  images?: string[];                 // Additional images
  isActive: boolean;                 // Visibility toggle
  category?: string;                 // Optional category
  tags?: string[];                   // Optional tags
  createdAt: timestamp;              // Creation date
  updatedAt: timestamp;              // Last update date
}

// Each product in bundle:
{
  productId: string;                 // Reference to product
  quantity: number;                  // How many of this product
  title?: string;                    // Product title (enriched)
  image?: string;                    // Product image (enriched)
}
```

---

## 🎯 Frontend Display Locations

### Homepage (`/`)

- **Location**: Between "New This Week" and "Plains" sections
- **Shows**: First 3 active bundles
- **Component**: BundleSection with `limit={3}`

### Products Page (`/products`)

- **Location**: Between product grid and footer
- **Shows**: All active bundles
- **Component**: BundleSection without limit

### Bundle Card Features

- Product count
- Original and bundle prices
- Discount percentage badge
- Customer savings amount
- "Add to Cart" button
- Hover effects and animations

---

## 🔌 API Usage

### Fetch Active Bundles (Public)

```javascript
GET /api/bundles
Response: Array of active Bundle objects
```

### Admin Operations

```javascript
// Create
POST /api/admin/bundles
Body: BundleFormData

// Update
PUT /api/admin/bundles?id=bundleId
Body: BundleFormData

// Delete
DELETE /api/admin/bundles?id=bundleId

// Get All (Admin)
GET /api/admin/bundles
Response: Array of all Bundle objects
```

---

## 💾 Firestore Collection

**Collection**: `bundles`

**Fields:**

- `name` - string
- `description` - string
- `products` - array of objects
- `originalTotalPrice` - number
- `bundlePrice` - number
- `isActive` - boolean
- `image` - string (URL)
- `images` - array of strings
- `category` - string
- `tags` - array of strings
- `createdAt` - timestamp
- `updatedAt` - timestamp

### Indexes Needed\*\* (if not auto-created):

- ~~`isActive ASC, createdAt DESC` - For fetching active bundles~~ **No longer needed!**
  - We now sort on the backend instead of requiring Firestore composite indexes
  - This eliminates the 500 error that occurred when indexes weren't created

---

## ✨ Features

✅ Create unlimited bundles  
✅ Add any quantity of products to bundle  
✅ Automatic price calculations  
✅ Real-time discount percentage display  
✅ Admin management interface with search & pagination  
✅ Toggle bundle active/inactive status  
✅ Mobile-responsive bundle cards  
✅ Hover effects and animations  
✅ Add bundle to cart functionality  
✅ Display on homepage and products page

---

## 🔒 Security Notes

- Admin API routes should be protected with authentication
- Consider adding Firebase Security Rules:
  ```
  match /bundles/{document=**} {
    // Allow read for all users
    allow read;
    // Only admins can write
    allow write: if request.auth.uid in get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.isAdmin;
  }
  ```

---

## 🐛 Troubleshooting

### Bundle not showing on frontend?

1. Check if `isActive` is set to `true`
2. Verify at least one product is selected
3. Check browser console for API errors
4. Clear browser cache
5. **500 Error Fix**: If you see a 500 error, this is fixed! The API now:
   - Avoids composite index requirements by sorting on the backend
   - Falls back to fetching all bundles (active + inactive) if needed
   - Automatically handles the retry logic

### Prices not calculating correctly?

1. Ensure original product prices are set in product data
2. Verify bundle products have valid product IDs
3. Check originalTotalPrice calculation in modal

### Admin panel not loading?

1. Verify you have admin access
2. Check Firebase connection
3. Ensure `bundle-model.ts` import is correct

---

## 📝 Future Enhancements

- [ ] Bundle image upload/custom image
- [ ] Bundle expiration dates
- [ ] Limit number of available bundles (stock)
- [ ] Seasonal bundle templates
- [ ] Bundle analytics/tracking
- [ ] Email notifications for popular bundles
- [ ] A/B testing different bundle prices

---

## 📞 Support

For issues or questions about the bundle feature implementation, check:

1. Console logs for JavaScript errors
2. Firebase console for data validation
3. Network tab for API response errors
4. Firestore Security Rules for permission issues
