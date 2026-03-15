/**
 * Bundle Image Helper
 * Generates fallback images for bundles without custom images
 */

/**
 * Generate a colorful placeholder image URL for a bundle
 * Uses a simple pattern-based image generation
 */
export function generateBundleImagePlaceholder(bundleName: string): string {
  // Create a hash from the bundle name to ensure consistency
  let hash = 0;
  for (let i = 0; i < bundleName.length; i++) {
    const char = bundleName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use hash to select a color scheme
  const colors = [
    "FF6B6B", // Red
    "4ECDC4", // Teal
    "45B7D1", // Blue
    "FFA07A", // Light Salmon
    "98D8C8", // Mint
    "6C63FF", // Purple
    "F7DC6F", // Yellow
    "BB8FCE", // Lavender
  ];

  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];

  // Generate a placeholder image with the bundle name
  const encodedName = encodeURIComponent(bundleName.substring(0, 20));
  return `https://via.placeholder.com/400x400/${bgColor}/FFFFFF?text=${encodedName}`;
}

/**
 * Get bundle display image
 * Returns the bundle image or a generated fallback
 */
export function getBundleDisplayImage(
  bundleImage: string | undefined,
  bundleName: string,
): string {
  if (bundleImage && bundleImage.trim()) {
    return bundleImage;
  }
  return generateBundleImagePlaceholder(bundleName);
}
