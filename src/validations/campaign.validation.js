import Joi from 'joi';

/**
 * Validation schema for campaign creation
 */
export const createCampaignSchema = Joi.object({
    mediaType: Joi.string()
        .valid('text', 'image', 'video')
        .required()
        .messages({
            'any.required': 'Media type is required',
            'any.only': 'Media type must be text, image, or video'
        }),

    message: Joi.string()
        .trim()
        .max(1000)
        .when('mediaType', {
            is: 'text',
            then: Joi.required(),
            otherwise: Joi.optional().allow('')
        })
        .messages({
            'string.empty': 'Message is required for text messages',
            'string.max': 'Message cannot exceed 1000 characters'
        }),

    phoneNumbers: Joi.string()
        .trim()
        .optional()
        .messages({
            'string.base': 'Phone numbers must be a string (single number or comma-separated numbers)',
            'string.empty': 'Phone numbers cannot be empty'
        })
});

/**
 * Validation schema for pagination queries
 */
export const paginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.min': 'Page number must be at least 1'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        })
});
