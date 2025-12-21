import { AddressFormData } from '../models/address.model';

const REQUIRED_FIELDS: { key: keyof AddressFormData; label: string }[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'streetAddress', label: 'Street Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'pincode', label: 'Pincode' },
  { key: 'mobileNumber', label: 'Mobile Number' },
];

export const validateAddress = (data: AddressFormData): string | null => {
  for (const { key, label } of REQUIRED_FIELDS) {
    if (!data[key].trim()) {
      return `${label} is required.`;
    }
  }
  return null;
};