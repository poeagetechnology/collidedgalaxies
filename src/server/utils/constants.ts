// ADDRESS FIELD CONSTANTS

import { AddressFormData } from '@/src/server/models/address.model';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal'
];

export const EMPTY_ADDRESS: AddressFormData = {
  firstName: '',
  lastName: '',
  streetAddress: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  mobileNumber: '',
};

// ADMIN SIDEBAR CONSTANTS

export const ADMIN_MENU_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Categories", href: "/admin/categories" },
  { name: "Products", href: "/admin/products" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Customers", href: "/admin/customers" },
  // { name: "Reviews", href: "/admin/reviews" },
  { name: "Admins", href: "/admin/admins" },
  { name: "Media Manager", href: "/admin/media-manager" },
];

export const REDIRECT_DELAY = 3000;

// AUTH CONSTANTS - Add these to your existing constants.ts file
export const PASSWORD_RULES = {
  minLength: 8,
  patterns: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  },
};

export const AUTH_ANIMATION_DURATION = 350;
export const AUTH_REDIRECT_DELAY = 1500;
export const AUTH_SUCCESS_DELAY = 2000;

export const PASSWORD_REQUIREMENT_LABELS = [
  { key: 'length' as const, label: 'At least 8 characters' },
  { key: 'uppercase' as const, label: 'At least 1 uppercase letter (A-Z)' },
  { key: 'lowercase' as const, label: 'At least 1 lowercase letter (a-z)' },
  { key: 'number' as const, label: 'At least 1 number (0-9)' },
  { key: 'special' as const, label: 'At least 1 special character (!@#$%^&*)' },
];