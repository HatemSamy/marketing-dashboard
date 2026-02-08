import express from 'express';
import {
    handleIncomingMessage,
    markMessageAsRead
} from '../controllers/webhook.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { incomingMessageSchema } from '../validations/webhook.validation.js';
import { webhookLimiter } from '../../config/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/webhooks/whatsapp
 * @desc    Handle incoming WhatsApp messages from UltraMessage webhook
 * @access  Public (webhook endpoint)
 */
router.post(
    '/whatsapp',
    webhookLimiter,
    validate(incomingMessageSchema),
    handleIncomingMessage
);

/**
 * @route   PATCH /api/webhooks/whatsapp/:id/read
 * @desc    Mark message as read
 * @access  Public (add auth later if needed)
 */
router.patch('/whatsapp/:id/read', markMessageAsRead);

export default router;
