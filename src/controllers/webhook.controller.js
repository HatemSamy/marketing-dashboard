import MessageLog from '../models/MessageLog.model.js';
import Campaign from '../models/Campaign.model.js';
import logger from '../utils/logger.js';

/**
 * Handle incoming WhatsApp messages from webhook
 * @route POST /api/webhooks/whatsapp
 */
export const handleIncomingMessage = async (req, res, next) => {
    try {
        const webhookData = req.body;

        logger.info('Received webhook:', webhookData);

        // Extract message data (adjust based on UltraMessage webhook format)
        const phone = webhookData.from || webhookData.phone;
        const messageBody = webhookData.body || webhookData.message || '';
        const messageType = webhookData.type || 'text';
        const timestamp = webhookData.timestamp ? new Date(webhookData.timestamp) : new Date();

        if (!phone) {
            logger.warn('Webhook received without phone number');
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Try to find related campaign by phone number
        const relatedMessage = await MessageLog.findOne({
            phone: phone,
            direction: 'outgoing'
        }).sort({ timestamp: -1 }).limit(1);

        const campaignId = relatedMessage ? relatedMessage.campaignId : null;

        // Save incoming message
        const incomingMessage = await MessageLog.create({
            campaignId,
            phone,
            direction: 'incoming',
            type: messageType,
            content: messageBody,
            status: 'delivered',
            timestamp,
            isRead: false
        });

        logger.info(`Incoming message saved: ${incomingMessage._id}`);

        // Send success response to webhook
        res.status(200).json({
            success: true,
            message: 'Message received and logged',
            data: {
                messageId: incomingMessage._id
            }
        });

    } catch (error) {
        logger.error('Error handling webhook:', error);
        next(error);
    }
};

/**
 * Mark message as read
 * @route PATCH /api/webhooks/whatsapp/:id/read
 */
export const markMessageAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const message = await MessageLog.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message marked as read',
            data: { message }
        });

    } catch (error) {
        next(error);
    }
};
