# Testimonial System - User Guide

## What's New

Your website now has a fully functional testimonial system that allows logged-in users to post reviews with the following features:

### ✨ Features

1. **User Authentication Required** - Only logged-in users can post testimonials
2. **Star Rating (1-5)** - Users can rate their experience with visual star selection
3. **Feedback Form** - Text area for detailed feedback (10-500 characters)
4. **Visibility Toggle** - Users can choose whether their testimonial is:
   - **Visible Immediately** ✓ - Shows right away on the site
   - **Pending Approval** ⏳ - Admin must approve before showing
5. **Success Confirmation** - Users get immediate feedback after posting
6. **Responsive Design** - Works perfectly on mobile and desktop

## How It Works

### For Users

1. **When there are no testimonials or permission error:**
   - A "Share Your Experience" button appears
   - Clicking it opens the testimonial form
   
2. **Submitting a Testimonial:**
   - User must be signed in
   - Choose a rating (1-5 stars)
   - Write feedback (minimum 10 characters)
   - Choose visibility (visible now or pending approval)
   - Click "Post Testimonial"
   - Get success confirmation
   
3. **Viewing Testimonials:**
   - Only approved testimonials are shown
   - Displayed in a grid with ratings and author info

### For Admins

Manage testimonials in the admin panel:
- See all submitted testimonials (approved and pending)
- Approve pending testimonials
- Edit testimonial visibility
- Delete inappropriate testimonials

## Updated Files

### New Components
- `src/components/TestimonialForm.tsx` - User form for submitting testimonials
- `src/hooks/useAuth.ts` - Authentication hook to check logged-in user

### Updated Files
- `src/components/testimonials.tsx` - Now shows form when no testimonials exist
- `src/hooks/useTestimonialManagement.ts` - Updated interface with userId field

## Firebase Data Structure

Each testimonial in the `testimonials` collection now has:

```json
{
  "id": "auto-generated",
  "author": "John Doe",
  "text": "Great products and fast shipping!",
  "rating": 5,
  "date": "Dec 25, 2025",
  "userId": "firebase-user-id",
  "approved": true,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### Fields Explanation

| Field | Type | Description |
|-------|------|-------------|
| `author` | String | User's display name or email |
| `text` | String | User's feedback (10-500 chars) |
| `rating` | Number | Star rating (1-5) |
| `date` | String | Formatted submission date |
| `userId` | String | Firebase user ID |
| `approved` | Boolean | Visibility flag (true = visible, false = pending) |
| `createdAt` | Timestamp | Creation timestamp |

## Firestore Rules Update Required

Make sure your Firestore rules allow:

```firestore
match /testimonials/{document=**} {
  allow read: if resource.data.approved == true || request.auth.uid != null;
  allow create: if request.auth.uid != null;
  allow update, delete: if request.auth.uid != null && 
                           (resource.data.userId == request.auth.uid || isAdmin(request.auth.uid));
}
```

## User Experience Flow

```
Landing on Home Page
    ↓
No testimonials/Error shown
    ↓
User clicks "Share Your Experience"
    ↓
[NOT LOGGED IN] → Shows sign-in prompt with link
[LOGGED IN] → Shows testimonial form
    ↓
User fills form:
  - Selects star rating
  - Writes feedback
  - Toggles visibility
    ↓
Clicks "Post Testimonial"
    ↓
Success screen with option to post another
    ↓
Testimonials section refreshes
    ↓
Form replaced with testimonials grid (if approved testimonials exist)
```

## Testing the Feature

1. **Create a test user account** (use your sign-in page)
2. **Navigate to home page** - See the testimonial section
3. **Click "Share Your Experience"**
4. **Fill out the form:**
   - Rate with stars
   - Write feedback (e.g., "Love these t-shirts, great quality!")
   - Choose visibility
5. **Submit** and confirm success message
6. **Go to Firestore** to verify the data was saved

### For Immediate Visibility:
- Toggle "Make visible immediately" ON
- Post will show up right away if approved testimonials exist

### For Admin Approval:
- Toggle "Make visible immediately" OFF
- Post will appear in admin panel as pending
- Admin must approve before it shows to public

## Common Issues & Solutions

### "Sign In to Share Your Experience"
- User is not logged in
- They need to click the "Sign In" button
- Solution: Ensure sign-in page is working

### Testimonial doesn't appear after posting
- User chose "Pending Approval"
- Admin hasn't approved it yet
- Solution: Admin approves in admin panel

### Form won't submit
- Feedback is less than 10 characters
- Feedback is empty
- Solution: Write more detailed feedback

## Next Steps (For Admin)

1. **Create Admin Panel Page** (if not done):
   - Show all testimonials (approved + pending)
   - Approval button for pending ones
   - Edit visibility toggle
   - Delete button

2. **Email Notifications** (optional):
   - Alert admin when new testimonial submitted
   - Notify user when their testimonial approved

3. **Moderation Dashboard**:
   - See statistics (total, approved, pending)
   - Bulk approve testimonials

---

**Everything is set up and ready to use!** Users can start posting reviews immediately once they're logged in.
