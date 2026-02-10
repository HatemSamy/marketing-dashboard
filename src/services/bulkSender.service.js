import ultraMessageService from './ultraMessage.service.js';
import Campaign from '../models/Campaign.model.js';
import MessageLog from '../models/MessageLog.model.js';
import logger from '../utils/logger.js';

/**
 * Bulk Sender Service - Optimized for Performance
 * Handles parallel batch processing of messages with efficient database updates
 */

// Configuration from environment variables
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 10; // Update DB every N messages
const CONCURRENCY_LIMIT = parseInt(process.env.CONCURRENCY_LIMIT) || 5; // Parallel messages
const MESSAGE_DELAY_MS = parseInt(process.env.MESSAGE_DELAY_MS) || 500; // Reduced delay
const RETRY_ATTEMPTS = parseInt(process.env.RETRY_ATTEMPTS) || 1;

/**
 * Send messages to all contacts in a campaign using parallel batch processing
 * @param {string} campaignId - Campaign ID
 * @param {Array<string>} phoneNumbers - Array of phone numbers
 * @param {Object} messageData - Message content and type
 */
const sendBulkMessages = async (campaignId, phoneNumbers, messageData) => {
    const { mediaType, message, mediaUrl } = messageData;
    const totalContacts = phoneNumbers.length;

    logger.info(`Starting optimized bulk send for campaign ${campaignId} to ${totalContacts} contacts`);
    logger.info(`Configuration: Batch=${BATCH_SIZE}, Concurrency=${CONCURRENCY_LIMIT}, Delay=${MESSAGE_DELAY_MS}ms`);

    // Update campaign status to 'sending'
    await Campaign.findByIdAndUpdate(campaignId, { status: 'sending' });

    let sentCount = 0;
    let failedCount = 0;
    const pendingLogs = []; // Batch message logs

    // Process contacts in batches with controlled concurrency
    for (let i = 0; i < totalContacts; i += BATCH_SIZE) {
        const batchPhones = phoneNumbers.slice(i, i + BATCH_SIZE);

        logger.debug(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: contacts ${i + 1}-${Math.min(i + BATCH_SIZE, totalContacts)}`);

        // Process batch with concurrency control
        const batchResults = await processBatchWithConcurrency(
            batchPhones,
            mediaType,
            message,
            mediaUrl,
            campaignId
        );

        // Aggregate results
        for (const result of batchResults) {
            if (result.status === 'sent') {
                sentCount++;
            } else {
                failedCount++;
            }
            pendingLogs.push(result.logEntry);
        }

        // Bulk insert message logs
        if (pendingLogs.length > 0) {
            await bulkInsertLogs(pendingLogs);
            pendingLogs.length = 0; // Clear after insert
        }

        // Update campaign progress (once per batch instead of per message)
        await Campaign.findByIdAndUpdate(campaignId, {
            sentCount,
            failedCount
        });

        logger.info(`Progress: ${sentCount + failedCount}/${totalContacts} (${sentCount} sent, ${failedCount} failed)`);
    }

    // Insert any remaining logs
    if (pendingLogs.length > 0) {
        await bulkInsertLogs(pendingLogs);
    }

    // Update final campaign status
    const finalStatus = failedCount === totalContacts ? 'failed' : 'completed';

    await Campaign.findByIdAndUpdate(campaignId, {
        status: finalStatus,
        sentCount,
        failedCount
    });

    logger.info(
        `Bulk send completed for campaign ${campaignId}: ` +
        `${sentCount} sent, ${failedCount} failed (${((sentCount / totalContacts) * 100).toFixed(1)}% success rate)`
    );

    return { sentCount, failedCount };
};

/**
 * Process a batch of phone numbers with controlled concurrency
 * @param {Array<string>} phones - Phone numbers to process
 * @param {string} mediaType - Message type
 * @param {string} message - Message content
 * @param {string} mediaUrl - Media URL
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Array>} Results with status and log entries
 */
const processBatchWithConcurrency = async (phones, mediaType, message, mediaUrl, campaignId) => {
    const results = [];
    const executing = [];

    for (const phone of phones) {
        // Create promise for this message
        const promise = sendMessageWithDelay(phone, mediaType, message, mediaUrl, campaignId)
            .then(result => {
                // Remove from executing when done
                executing.splice(executing.indexOf(promise), 1);
                return result;
            });

        results.push(promise);
        executing.push(promise);

        // If we've reached concurrency limit, wait for one to complete
        if (executing.length >= CONCURRENCY_LIMIT) {
            await Promise.race(executing);
        }
    }

    // Wait for all remaining promises
    return await Promise.all(results);
};

/**
 * Send a single message with delay and return result
 * @param {string} phone - Phone number
 * @param {string} mediaType - Message type
 * @param {string} message - Message content
 * @param {string} mediaUrl - Media URL
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Result with status and log entry
 */
const sendMessageWithDelay = async (phone, mediaType, message, mediaUrl, campaignId) => {
    try {
        // Apply delay before sending
        if (MESSAGE_DELAY_MS > 0) {
            await wait(MESSAGE_DELAY_MS);
        }

        // Send message
        await sendMessage(phone, mediaType, message, mediaUrl);

        return {
            status: 'sent',
            phone,
            logEntry: createLogEntry(campaignId, phone, mediaType, message, 'sent', null)
        };

    } catch (error) {
        logger.error(`Failed to send message to ${phone}:`, error.message);

        return {
            status: 'failed',
            phone,
            logEntry: createLogEntry(campaignId, phone, mediaType, message, 'failed', error.message)
        };
    }
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

    // Send with retry logic
    return await ultraMessageService.sendWithRetry(sendFunction, RETRY_ATTEMPTS);
};

/**
 * Create a message log entry object
 * @param {string} campaignId - Campaign ID
 * @param {string} phone - Phone number
 * @param {string} type - Message type
 * @param {string} content - Message content
 * @param {string} status - Message status
 * @param {string} error - Error message (if failed)
 * @returns {Object} Log entry
 */
const createLogEntry = (campaignId, phone, type, content, status, error = null) => {
    return {
        campaignId,
        phone,
        direction: 'outgoing',
        type,
        content,
        status,
        error,
        timestamp: new Date()
    };
};

/**
 * Bulk insert message logs to database
 * @param {Array<Object>} logs - Array of log entries
 */
const bulkInsertLogs = async (logs) => {
    try {
        if (logs.length === 0) return;

        await MessageLog.insertMany(logs, { ordered: false });
        logger.debug(`Bulk inserted ${logs.length} message logs`);
    } catch (logError) {
        logger.error('Failed to bulk insert logs:', logError.message);
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
