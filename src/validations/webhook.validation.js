import Joi from 'joi';

/**
 * Validation schema for incoming webhook messages
 */
export const incomingMessageSchema = Joi.object({
    from: Joi.string()
        .required()
        .messages({
            'any.required': 'Sender phone number is required'
        }),

    body: Joi.string()
        .allow('')
        .default('')
        .messages({
            'string.base': 'Message body must be a string'
        }),

    type: Joi.string()
        .valid('text', 'image', 'video', 'document', 'audio')
        .default('text'),

    // Additional fields that might come from UltraMessage
    id: Joi.string().optional(),
    timestamp: Joi.alternatives().try(
        Joi.number(),
        Joi.string(),
        Joi.date()
    ).optional(),

    // Allow other fields
}).unknown(true);
