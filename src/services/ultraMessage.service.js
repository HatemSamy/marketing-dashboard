import axios from 'axios';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * UltraMessage WhatsApp API Service
 */

let client = null;
let baseURL = null;
let token = null;
let instanceId = null;

/**
 * Initialize the service with credentials
 */
const initialize = () => {
    if (client) return; // Already initialized

    baseURL = process.env.ULTRAMESSAGE_BASE_URL;
    token = process.env.ULTRAMESSAGE_TOKEN;
    instanceId = process.env.ULTRAMESSAGE_INSTANCE_ID;

    if (!baseURL || !token) {
        throw new Error('UltraMessage credentials are not properly configured in .env');
    }

    // Create axios instance
    client = axios.create({
        baseURL: baseURL,
        timeout: 30000, // 30 seconds
        params: {
            token: token
        }
    });
};

/**
 * Send text message
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
const sendTextMessage = async (phone, message) => {
    try {
        initialize(); // Ensure service is initialized

        logger.info(`Sending text message to ${phone}`);

        const response = await client.post('/messages/chat', {
            to: phone,
            body: message
        });

        logger.info(`Text message sent successfully to ${phone}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to send text message to ${phone}:`, error.message);
        throw handleError(error, phone);
    }
};

/**
 * Send image message with caption
 * @param {string} phone - Recipient phone number
 * @param {string} imageUrl - URL to the image
 * @param {string} caption - Image caption
 * @returns {Promise<Object>} - API response
 */
const sendImageMessage = async (phone, imageUrl, caption = '') => {
    try {
        initialize(); // Ensure service is initialized

        logger.info(`Sending image message to ${phone}`);

        const response = await client.post('/messages/image', {
            to: phone,
            image: imageUrl,
            caption: caption
        });

        logger.info(`Image message sent successfully to ${phone}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to send image message to ${phone}:`, error.message);
        throw handleError(error, phone);
    }
};

/**
 * Send video message with caption
 * @param {string} phone - Recipient phone number
 * @param {string} videoUrl - URL to the video
 * @param {string} caption - Video caption
 * @returns {Promise<Object>} - API response
 */
const sendVideoMessage = async (phone, videoUrl, caption = '') => {
    try {
        initialize(); // Ensure service is initialized

        logger.info(`Sending video message to ${phone}`);

        const response = await client.post('/messages/video', {
            to: phone,
            video: videoUrl,
            caption: caption
        });

        logger.info(`Video message sent successfully to ${phone}`);
        return response.data;
    } catch (error) {
        logger.error(`Failed to send video message to ${phone}:`, error.message);
        throw handleError(error, phone);
    }
};

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @param {string} phone - Phone number
 * @returns {ApiError} - Formatted error
 */
const handleError = (error, phone) => {
    if (error.response) {
        // API responded with error
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Unknown API error';

        return new ApiError(
            status,
            `Failed to send message to ${phone}: ${message}`
        );
    } else if (error.request) {
        // Request made but no response
        return new ApiError(
            503,
            `No response from WhatsApp API for ${phone}. Service may be unavailable.`
        );
    } else {
        // Other errors
        return new ApiError(
            500,
            `Error sending message to ${phone}: ${error.message}`
        );
    }
};

/**
 * Send message with retry logic
 * @param {Function} sendFunction - Function to execute
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} - API response
 */
const sendWithRetry = async (sendFunction, maxRetries = 1) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await sendFunction();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                logger.warn(`Retry attempt ${attempt + 1} after error:`, error.message);
                // Wait 2 seconds before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    throw lastError;
};

// Export service methods
export default {
    sendTextMessage,
    sendImageMessage,
    sendVideoMessage,
    sendWithRetry
};
