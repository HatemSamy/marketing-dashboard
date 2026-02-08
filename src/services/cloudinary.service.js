import cloudinary from '../../config/cloudinary.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import { Readable } from 'stream';

/**
 * Cloudinary Service for Serverless Environment
 * Handles uploading images and videos from Buffer (memory storage)
 */

/**
 * Upload image to Cloudinary from Buffer
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} originalName - Original filename
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadImage = async (buffer, originalName) => {
    try {
        logger.info(`Uploading image to Cloudinary: ${originalName}`);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'whatsapp-campaigns/images',
                    resource_type: 'image',
                    use_filename: true,
                    unique_filename: true
                },
                (error, result) => {
                    if (error) {
                        logger.error('Cloudinary upload error:', error);
                        reject(new ApiError(500, `Failed to upload image: ${error.message}`));
                    } else {
                        logger.info(`Image uploaded successfully: ${result.secure_url}`);
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id
                        });
                    }
                }
            );

            // Convert buffer to stream and pipe to Cloudinary
            const readableStream = Readable.from(buffer);
            readableStream.pipe(uploadStream);
        });
    } catch (error) {
        logger.error('Failed to upload image to Cloudinary:', error.message);
        throw new ApiError(500, `Failed to upload image: ${error.message}`);
    }
};

/**
 * Upload video to Cloudinary from Buffer
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} originalName - Original filename
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadVideo = async (buffer, originalName) => {
    try {
        logger.info(`Uploading video to Cloudinary: ${originalName}`);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'whatsapp-campaigns/videos',
                    resource_type: 'video',
                    use_filename: true,
                    unique_filename: true
                },
                (error, result) => {
                    if (error) {
                        logger.error('Cloudinary upload error:', error);
                        reject(new ApiError(500, `Failed to upload video: ${error.message}`));
                    } else {
                        logger.info(`Video uploaded successfully: ${result.secure_url}`);
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id
                        });
                    }
                }
            );

            // Convert buffer to stream and pipe to Cloudinary
            const readableStream = Readable.from(buffer);
            readableStream.pipe(uploadStream);
        });
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

