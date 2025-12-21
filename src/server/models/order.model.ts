// Order Item Interface
export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: string;
  size?: string;
  color?: {
    name: string;
    hex: string;
  };
  image?: string;
  isCombo?: boolean;
  id: string;
  uniqueKey: string;
}

// Shipping Address Interface
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

// Order Status Type
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Main Order Interface
export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  totalProducts: number;
  paymentMode: string;
  paymentId: string;
  status: OrderStatus;
  orderDate: Date;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  userId?: string;
  firestoreDocId?: string;

  // ADD THIS 👇
  paymentStatus?: 'pending' | 'paid';
}

// Filter Options
export interface OrderFilters {
  searchQuery: string;
  statusFilter: string;
}

// Firebase Address Structure
export interface FirebaseAddress {
  firstName: string;
  lastName: string;
  streetAddress: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  mobileNumber: string;
}