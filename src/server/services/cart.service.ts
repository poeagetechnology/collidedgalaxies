import { CartItem } from '@/src/context/CartContext';

export const getColorDisplay = (color: any): string => {
  if (!color) return 'N/A';
  if (typeof color === 'object' && color.name) return color.name;
  if (typeof color === 'string') return color;
  return 'N/A';
};

export const getGroupKey = (item: CartItem): string => {
  return (item as any).comboKey || (item as any).productId || item.uniqueKey || item.title || 'combo';
};

export const buildComboLimitMap = (comboItems: CartItem[]): Record<string, { required: number; total: number }> => {
  const map: Record<string, { required: number; total: number }> = {};
  comboItems.forEach((item: any) => {
    const key = item?.productId;
    if (!key) return;
    if (!map[key]) {
      map[key] = { required: item.comboQuantity ?? 0, total: 0 };
    }
    map[key].total += item.quantity || 0;
  });
  return map;
};

export const buildComboStatus = (comboItems: CartItem[]) => {
  const distinctKeys = Array.from(new Set(comboItems.map(getGroupKey)));
  return distinctKeys.map((key) => {
    const items = comboItems.filter((item) => getGroupKey(item) === key);
    const requiredQty = (items[0] as any)?.comboQuantity ?? 0;
    const currentCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
    const hasRequirement = requiredQty > 0;
    return {
      comboKey: key,
      requiredComboQty: requiredQty,
      currentComboCount: currentCount,
      isFull: hasRequirement && currentCount >= requiredQty,
      isUnder: hasRequirement && currentCount < requiredQty,
      slotsLeft: hasRequirement ? Math.max(requiredQty - currentCount, 0) : 0,
    };
  });
};

export const calculateSubtotal = (cartItems: CartItem[]): number => {
  const comboItems = cartItems.filter((item: any) => item.isCombo);
  const regularItems = cartItems.filter((item: any) => !item.isCombo);

  // Build combo groups
  const comboGroups: Record<string, { items: any[]; required: number; offerPrice: number; total: number }> = {};
  comboItems.forEach((item: any) => {
    const key = item?.productId;
    if (!key) return;
    if (!comboGroups[key]) {
      comboGroups[key] = { items: [], required: item.comboQuantity ?? 0, offerPrice: item.comboOfferPrice ?? 0, total: 0 };
    }
    comboGroups[key].items.push(item);
    comboGroups[key].total += item.quantity || 0;
  });

  // Combo pricing
  let comboTotal = 0;
  Object.values(comboGroups).forEach((group) => {
    if (group.total === group.required && group.offerPrice) {
      comboTotal += group.offerPrice;
    } else {
      comboTotal += group.items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
    }
  });

  // Regular pricing
  const regularTotal = regularItems.reduce((sum, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0);

  return comboTotal + regularTotal;
};