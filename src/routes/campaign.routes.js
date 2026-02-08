import express from 'express';
import {
    createCampaign,
    getAllCampaigns,
    getCampaignById
} from '../controllers/campaign.controller.js';
import { uploadCampaignFiles } from '../middlewares/upload.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import { createCampaignSchema } from '../validations/campaign.validation.js';
import { campaignLimiter } from '../../config/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/campaigns
 * @desc    Create a new campaign
 * @access  Public (add auth later if needed)
 */
router.post(
    '/',
    campaignLimiter,
    uploadCampaignFiles,
    validate(createCampaignSchema),
    createCampaign
);

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns
 * @access  Public (add auth later if needed)
 */
router.get('/', getAllCampaigns);

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Public (add auth later if needed)
 */
router.get('/:id', getCampaignById);

export default router;
