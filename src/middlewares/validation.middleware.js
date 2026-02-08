/**
 * Validation middleware using Joi schemas
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errorMessage
            });
        }

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};

export default validate;
