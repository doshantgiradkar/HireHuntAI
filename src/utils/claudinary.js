import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.resolve(".env.local") })


console.log(process.env.CLOUDINARY_CLOUD_NAME);

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Upload function
export const uploadResume = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error('No file path provided');
        }

        // Verify file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
        }

        // Log file details
        console.log('Uploading file:', {
            path: filePath,
            size: fs.statSync(filePath).size
        });

        // Upload with promise wrapper and timeout
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                filePath,
                {
                    resource_type: "auto",
                    folder: "hirehuntai/resume",
                    timeout: 120000,
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary upload success:', result?.secure_url);
                        resolve(result);
                    }
                }
            );
        });

        return result;
    } catch (error) {
        console.error('Upload to Cloudinary failed:', error);
        throw new Error('Failed to upload image to cloud storage');
    }
};


// Delete function
export const deleteResume = async (imageUrl) => {
    try {
        if (!imageUrl) return null;

        // Extract public_id from the URL
        const publicId = imageUrl.match(/resume\/([^/.]+)\.pdf$/);
        const result = await cloudinary.uploader.destroy(publicId[1]);
        return result;
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
        throw new Error('Failed to delete image from cloudinary');
    }
};
