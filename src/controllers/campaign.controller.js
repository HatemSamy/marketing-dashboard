import Campaign from '../models/Campaign.model.js';
import excelService from '../services/excel.service.js';
import bulkSenderService from '../services/bulkSender.service.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import path from 'path';

/**
 * Parse and validate phone numbers from string input
 * @param {string} phoneNumbersString - Single number or comma-separated numbers
 * @returns {string[]} Array of validated phone numbers
 */
const parsePhoneNumbers = (phoneNumbersString) => {
    if (!phoneNumbersString || typeof phoneNumbersString !== 'string') {
        throw new ApiError(400, 'Phone numbers must be provided as a string');
    }

    // Split by comma and clean up
    const numbers = phoneNumbersString
        .split(',')
        .map(num => num.trim())
        .filter(num => num.length > 0);

    if (numbers.length === 0) {
        throw new ApiError(400, 'No valid phone numbers provided');
    }

    // Validate and sanitize each phone number
    const validatedNumbers = numbers.map(num => {
        // Remove common formatting characters
        const cleaned = num.replace(/[\s\-\(\)\+]/g, '');

        // Validate format: should be 10-15 digits
        if (!/^\d{10,15}$/.test(cleaned)) {
            throw new ApiError(400, `Invalid phone number format: ${num}. Expected 10-15 digits in international format.`);
        }

        return cleaned;
    });

    return validatedNumbers;
};

/**
 * Create a new campaign
 * @route POST /api/campaigns
 */
export const createCampaign = async (req, res, next) => {
    try {
        const { mediaType, message, phoneNumbers: phoneNumbersInput } = req.body;
        const files = req.files;

        // ========== DEBUGGING LOGS ==========
        logger.info('=== CREATE CAMPAIGN REQUEST ===');
        logger.info(`Media Type: ${mediaType}`);
        logger.info(`Message: ${message}`);
        logger.info(`Phone Numbers Input: ${phoneNumbersInput}`);
        logger.info('Files received:', {
            hasFiles: !!files,
            fileFields: files ? Object.keys(files) : [],
            mediaFile: files?.mediaFile ? {
                fieldname: files.mediaFile[0].fieldname,
                originalname: files.mediaFile[0].originalname,
                mimetype: files.mediaFile[0].mimetype,
                size: files.mediaFile[0].size,
                path: files.mediaFile[0].path
            } : 'No media file',
            excelFile: files?.excelFile ? {
                originalname: files.excelFile[0].originalname,
                size: files.excelFile[0].size
            } : 'No excel file'
        });
        // ====================================

        // Check input method: phoneNumbers OR excelFile
        const hasPhoneNumbers = phoneNumbersInput && phoneNumbersInput.trim().length > 0;
        const hasExcelFile = files && files.excelFile;

        // Validate mutual exclusivity
        if (hasPhoneNumbers && hasExcelFile) {
            throw new ApiError(400, 'Cannot provide both phoneNumbers and excelFile. Please use only one method.');
        }

        // Validate at least one method is provided
        if (!hasPhoneNumbers && !hasExcelFile) {
            throw new ApiError(400, 'Either phoneNumbers or excelFile is required');
        }

        // Validate media file for image/video types
        if ((mediaType === 'image' || mediaType === 'video') && (!files || !files.mediaFile)) {
            logger.error(`Media file validation failed for ${mediaType} type. Files:`, files);
            throw new ApiError(400, `Media file is required for ${mediaType} messages`);
        }

        // Validate message for text type
        if (mediaType === 'text' && (!message || message.trim() === '')) {
            throw new ApiError(400, 'Message is required for text messages');
        }

        const mediaFile = files && files.mediaFile ? files.mediaFile[0] : null;
        let phoneNumbers;

        // Process phone numbers based on input method
        if (hasPhoneNumbers) {
            // Direct phone number input
            logger.info('Processing direct phone number input...');
            phoneNumbers = parsePhoneNumbers(phoneNumbersInput);
            logger.info(`Parsed ${phoneNumbers.length} phone number(s) from direct input`);
        } else {
            // Excel file input
            const excelFile = files.excelFile[0];
            logger.info('Processing Excel file...');
            phoneNumbers = await excelService.parseExcelFile(excelFile.path);
            logger.info(`Parsed ${phoneNumbers.length} phone number(s) from Excel file`);
        }

        if (!phoneNumbers || phoneNumbers.length === 0) {
            throw new ApiError(400, 'No valid phone numbers found');
        }

        // Upload media to Cloudinary and get URL
        let mediaUrl = null;
        if (mediaFile) {
            logger.info('Uploading media to Cloudinary...');

            // Dynamically import cloudinary service
            const cloudinaryService = await import('../services/cloudinary.service.js');

            let uploadResult;
            if (mediaType === 'image') {
                uploadResult = await cloudinaryService.uploadImage(mediaFile.path, mediaFile.originalname);
            } else if (mediaType === 'video') {
                uploadResult = await cloudinaryService.uploadVideo(mediaFile.path, mediaFile.originalname);
            }

            mediaUrl = uploadResult.url;
            logger.info(`Media uploaded to Cloudinary: ${mediaUrl}`);
        }

        // Create campaign in database
        const campaign = await Campaign.create({
            message: message || '',
            mediaType,
            mediaUrl,
            totalContacts: phoneNumbers.length,
            status: 'pending'
        });

        logger.info(`Campaign created: ${campaign._id}`);
        logger.info(`Campaign details:`, {
            id: campaign._id,
            mediaType: campaign.mediaType,
            mediaUrl: campaign.mediaUrl,
            totalContacts: campaign.totalContacts,
            message: campaign.message
        });

        // Start bulk sending asynchronously (don't wait)
        setImmediate(async () => {
            try {
                logger.info(`Starting bulk send for campaign ${campaign._id}`);
                await bulkSenderService.sendBulkMessages(
                    campaign._id.toString(),
                    phoneNumbers,
                    { mediaType, message, mediaUrl }
                );
            } catch (error) {
                logger.error(`Error in bulk sending for campaign ${campaign._id}:`, error);
            }
        });

        // Return immediate response
        res.status(201).json({
            success: true,
            message: 'Campaign created successfully and processing started',
            data: {
                campaign: {
                    id: campaign._id,
                    mediaType: campaign.mediaType,
                    totalContacts: campaign.totalContacts,
                    status: campaign.status,
                    createdAt: campaign.createdAt
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get all campaigns
 * @route GET /api/campaigns
 */
export const getAllCampaigns = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get campaigns with pagination
        const campaigns = await Campaign.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        // Get total count
        const total = await Campaign.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                campaigns,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get campaign by ID
 * @route GET /api/campaigns/:id
 */
export const getCampaignById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const campaign = await Campaign.findById(id).select('-__v');

        if (!campaign) {
            throw new ApiError(404, 'Campaign not found');
        }

        res.status(200).json({
            success: true,
            data: { campaign }
        });

    } catch (error) {
        next(error);
    }
};
