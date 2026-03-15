const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";


export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export interface CloudinaryError {
  error: {
    message: string;
  };
}

/**
 * Upload a single file to Cloudinary
 * @param file File to upload
 * @param folder Cloudinary folder (default: "uploads")
 * @returns secure_url string
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = "products"
): Promise<string> => {
  // Get fresh values from environment
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      `Cloudinary configuration missing: cloudName=${cloudName ? "✓" : "✗"}, uploadPreset=${uploadPreset ? "✓" : "✗"}. Check your .env.local file.`
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Cloudinary upload failed: ${data.error?.message || response.statusText}`
      );
    }

    return data.secure_url;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files Array of File objects
 * @param folder Cloudinary folder name
 * @returns array of secure URLs
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  folder: string = "uploads"
): Promise<string[]> => {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file, folder)
  );
  return Promise.all(uploadPromises);
};

/**
 * Extract public_id from Cloudinary URL
 * @param url Cloudinary secure_url
 * @returns public_id or null
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    return null;
  }
};

/**
 * Generate transformed Cloudinary URLs
 * @param url Original image URL
 * @param transformations (e.g., "w_500,h_500,c_fill")
 */
export const getTransformedUrl = (
  url: string,
  transformations: string
): string => {
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return url;

    return (
      url.slice(0, uploadIndex + 8) +
      transformations +
      "/" +
      url.slice(uploadIndex + 8)
    );
  } catch (error) {
    return url;
  }
};

/**
 * Common Cloudinary transformation presets
 */
export const CloudinaryTransforms = {
  thumbnail: "w_150,h_150,c_fill",
  small: "w_300,h_300,c_fill",
  medium: "w_600,h_600,c_fill",
  large: "w_1200,h_1200,c_fill",
  avatar: "w_200,h_200,c_fill,g_face",
  banner: "w_1920,h_400,c_fill",
};

/**
 * Delete image from Cloudinary
 * ⚠️ MUST be done server-side
 */
export const deleteFromCloudinary = async (
  publicId: string
): Promise<void> => {
  throw new Error("Client-side deletion not implemented for security reasons.");
};