import express from 'express';
import { getMessages } from '../controllers/message.controller.js';

const router = express.Router();

/**
 * @route   GET /api/messages
 * @desc    Get messages with optional filters (campaignId, phone, direction)
 * @access  Public (add auth later if needed)
 * @query   campaignId, phone, direction, page, limit
 */
router.get('/', getMessages);

export default router;
