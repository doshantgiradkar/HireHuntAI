import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.resolve(".env.local") })


// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function
 const uploadToCloudinary = async (filePath,folder="resume") => {
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
                    folder: `hirehuntai/${folder}`,
                    timeout: 120000,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });

        return result;
    } catch (error) {
        console.error('Upload to Cloudinary failed:', error);
        // throw new Error('Failed to upload image to cloud storage');
    }
};


// Delete function
 const deleteFromCloudinary = async (url) => {
    try {
        if (!url) return null;

        const publicId = url.match(/(hirehuntai\/(resume|logo)\/[^/.]+)\.(pdf|jpeg)$/);
        const result = await cloudinary.uploader.destroy(publicId[1]);
        return result;
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
        throw new Error('Failed to delete image from cloudinary');
    }
};

export const uploadResume = async (filePath) => {
    return await uploadToCloudinary(filePath,"resume");
}

export const deleteResume = async (url) => {
    return await deleteFromCloudinary(url);
}

export const uploadLogo = async (filePath) => {
    return await uploadToCloudinary(filePath,"logo");
}   

export const deleteLogo = async (url) => {
    return await deleteFromCloudinary(url);
}

