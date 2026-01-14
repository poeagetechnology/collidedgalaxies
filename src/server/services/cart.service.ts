import { CartItem } from '@/src/context/CartContext';

export const getColorDisplay = (color: any): string => {
  if (!color) return 'N/A';
  if (typeof color === 'object' && color.name) return color.name;
  if (typeof color === 'string') return color;
  return 'N/A';
};

export const calculateSubtotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((sum, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0);
};