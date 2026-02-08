import cloudinary from '../../config/cloudinary.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import fs from 'fs/promises';

/**
 * Cloudinary Service
 * Handles uploading images and videos to Cloudinary
 */

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} originalName - Original filename
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadImage = async (filePath, originalName) => {
    try {
        logger.info(`Uploading image to Cloudinary: ${originalName}`);

        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'whatsapp-campaigns/images',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true
        });

        logger.info(`Image uploaded successfully: ${result.secure_url}`);

        // Delete local file after upload
        await fs.unlink(filePath).catch(err =>
            logger.warn(`Failed to delete local file ${filePath}:`, err.message)
        );

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        logger.error('Failed to upload image to Cloudinary:', error.message);
        throw new ApiError(500, `Failed to upload image: ${error.message}`);
    }
};

/**
 * Upload video to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} originalName - Original filename
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadVideo = async (filePath, originalName) => {
    try {
        logger.info(`Uploading video to Cloudinary: ${originalName}`);

        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'whatsapp-campaigns/videos',
            resource_type: 'video',
            use_filename: true,
            unique_filename: true
        });

        logger.info(`Video uploaded successfully: ${result.secure_url}`);

        // Delete local file after upload
        await fs.unlink(filePath).catch(err =>
            logger.warn(`Failed to delete local file ${filePath}:`, err.message)
        );

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        logger.error('Failed to upload video to Cloudinary:', error.message);
        throw new ApiError(500, `Failed to upload video: ${error.message}`);
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' or 'video'
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
    try {
        logger.info(`Deleting ${resourceType} from Cloudinary: ${publicId}`);

        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        logger.info(`${resourceType} deleted successfully`);
    } catch (error) {
        logger.error(`Failed to delete ${resourceType} from Cloudinary:`, error.message);
        // Don't throw - deletion failure shouldn't stop the process
    }
};

export default {
    uploadImage,
    uploadVideo,
    deleteFile
};
