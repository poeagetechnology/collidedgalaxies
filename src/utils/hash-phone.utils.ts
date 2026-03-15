/**
 * Utility to generate deterministic guest account IDs from phone numbers
 * Used for Firestore document IDs and guest UID generation
 *
 * This ensures the same phone number always produces the same guest ID
 * allowing direct document access without collection queries
 */

export function hashPhoneNumber(phone: string): string {
  // Normalize phone: digits only
  const normalizedPhone = phone.replace(/\D/g, '');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalizedPhone.length; i++) {
    const char = normalizedPhone.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `guest_${Math.abs(hash).toString(16)}`;
}
