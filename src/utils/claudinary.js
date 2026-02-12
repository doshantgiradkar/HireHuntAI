import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/* ---------------- CONFIG ---------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ---------------- UPLOAD ---------------- */

const uploadToCloudinary = async (
  filePath,
  {
    folder = "resume",
    resource_type = "auto",
  } = {}
) => {
  if (!filePath) throw new Error("No file path provided");

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `hirehuntai/${folder}`,
      resource_type,
      timeout: 120000,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Failed:", error);
    throw error; // 🔥 NEVER swallow errors
  }
};

/* ---------------- DELETE ---------------- */

const deleteFromCloudinary = async (url, resource_type = "image") => {
  if (!url) return null;

  try {
    /**
     * Example URL:
     * https://res.cloudinary.com/.../upload/v123/hirehuntai/logo/abc123.png
     */
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");

    const publicIdWithExt = parts
      .slice(uploadIndex + 2)
      .join("/")
      .split(".")[0];

    return await cloudinary.uploader.destroy(publicIdWithExt, {
      resource_type,
    });
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw error;
  }
};

/* ---------------- EXPORTS ---------------- */

export const uploadResume = async (filePath) =>
  uploadToCloudinary(filePath, {
    folder: "resume",
    resource_type: "raw",
  });

export const deleteResume = async (url) =>
  deleteFromCloudinary(url, "raw");

export const uploadLogo = async (filePath) =>
  uploadToCloudinary(filePath, {
    folder: "logo",
    resource_type: "image",
  });

export const deleteLogo = async (url) =>
  deleteFromCloudinary(url, "image");


export const uploadOfferLetter = async (
  pdfBuffer,
  { folder = "offer_letters", resource_type = "raw" } = {}
) => {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error("A valid PDF buffer is required");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `hirehuntai/${folder}`,
        resource_type,
        use_filename: true,
        unique_filename: true,
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Offer Letter Upload Failed:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(pdfBuffer);
  });
};


export const deleteOfferLetter = async (url) => {
  if (!url) return null;

  try {
    // Extract public ID from URL (same logic as deleteResume)
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    const publicIdWithExt = parts
      .slice(uploadIndex + 2)
      .join("/")
      .split(".")[0];

    return await cloudinary.uploader.destroy(publicIdWithExt, {
      resource_type: "raw",
    });
  } catch (error) {
    console.error("Cloudinary Offer Letter Delete Error:", error);
    throw error;
  }
};