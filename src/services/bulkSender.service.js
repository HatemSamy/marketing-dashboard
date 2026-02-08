import ultraMessageService from './ultraMessage.service.js';
import Campaign from '../models/Campaign.model.js';
import MessageLog from '../models/MessageLog.model.js';
import logger from '../utils/logger.js';

/**
 * Bulk Sender Service
 * Handles sequential sending of messages to multiple contacts
 */

const delay = parseInt(process.env.MESSAGE_DELAY_MS) || 1500;

/**
 * Send messages to all contacts in a campaign
 * @param {string} campaignId - Campaign ID
 * @param {Array<string>} phoneNumbers - Array of phone numbers
 * @param {Object} messageData - Message content and type
 */
const sendBulkMessages = async (campaignId, phoneNumbers, messageData) => {
    const { mediaType, message, mediaUrl } = messageData;

    logger.info(`Starting bulk send for campaign ${campaignId} to ${phoneNumbers.length} contacts`);

    // Update campaign status to 'sending'
    await Campaign.findByIdAndUpdate(campaignId, { status: 'sending' });

    let sentCount = 0;
    let failedCount = 0;

    // Process each contact sequentially
    for (const phone of phoneNumbers) {
        try {
            // Apply delay before sending (except for first message)
            if (sentCount + failedCount > 0) {
                await wait(delay);
            }

            // Send message based on type
            await sendMessage(phone, mediaType, message, mediaUrl);

            // Log successful message
            await logMessage(campaignId, phone, mediaType, message, 'sent');

            sentCount++;

            // Update campaign progress
            await Campaign.findByIdAndUpdate(campaignId, {
                sentCount: sentCount,
                failedCount: failedCount
            });

            logger.debug(`Message sent to ${phone} (${sentCount}/${phoneNumbers.length})`);

        } catch (error) {
            // Log failed message
            await logMessage(
                campaignId,
                phone,
                mediaType,
                message,
                'failed',
                error.message
            );

            failedCount++;

            // Update campaign progress
            await Campaign.findByIdAndUpdate(campaignId, {
                sentCount: sentCount,
                failedCount: failedCount
            });

            logger.error(`Failed to send message to ${phone}:`, error.message);

            // Continue with next contact despite failure
            continue;
        }
    }

    // Update final campaign status
    const finalStatus = failedCount === phoneNumbers.length ? 'failed' : 'completed';

    await Campaign.findByIdAndUpdate(campaignId, {
        status: finalStatus,
        sentCount: sentCount,
        failedCount: failedCount
    });

    logger.info(
        `Bulk send completed for campaign ${campaignId}: ` +
        `${sentCount} sent, ${failedCount} failed`
    );

    return { sentCount, failedCount };
};

/**
 * Send a single message based on type
 * @param {string} phone - Phone number
 * @param {string} mediaType - Message type
 * @param {string} message - Message content
 * @param {string} mediaUrl - Media URL (for image/video)
 */
const sendMessage = async (phone, mediaType, message, mediaUrl) => {
    const sendFunction = async () => {
        switch (mediaType) {
            case 'text':
                return await ultraMessageService.sendTextMessage(phone, message);

            case 'image':
                return await ultraMessageService.sendImageMessage(phone, mediaUrl, message);

            case 'video':
                return await ultraMessageService.sendVideoMessage(phone, mediaUrl, message);

            default:
                throw new Error(`Invalid media type: ${mediaType}`);
        }
    };

    // Send with retry logic (1 retry)
    return await ultraMessageService.sendWithRetry(sendFunction, 1);
};

/**
 * Log message to database
 * @param {string} campaignId - Campaign ID
 * @param {string} phone - Phone number
 * @param {string} type - Message type
 * @param {string} content - Message content
 * @param {string} status - Message status
 * @param {string} error - Error message (if failed)
 */
const logMessage = async (campaignId, phone, type, content, status, error = null) => {
    try {
        await MessageLog.create({
            campaignId,
            phone,
            direction: 'outgoing',
            type,
            content,
            status,
            error,
            timestamp: new Date()
        });
    } catch (logError) {
        logger.error('Failed to log message:', logError.message);
        // Don't throw - logging failure shouldn't stop the campaign
    }
};

/**
 * Wait for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 */
const wait = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Export service methods
export default {
    sendBulkMessages
};
