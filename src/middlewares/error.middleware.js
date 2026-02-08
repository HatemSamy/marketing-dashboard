import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Convert non-ApiError errors to ApiError
    if (!(error instanceof ApiError)) {
        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors)
                .map(e => e.message)
                .join(', ');
            error = new ApiError(400, message);
        }
        // Mongoose duplicate key error
        else if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            error = new ApiError(400, `Duplicate value for field: ${field}`);
        }
        // Mongoose cast error (invalid ObjectId)
        else if (error.name === 'CastError') {
            error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
        }
        // Multer file size error
        else if (error.code === 'LIMIT_FILE_SIZE') {
            error = new ApiError(400, 'File size is too large');
        }
        // Multer unexpected field error
        else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            error = new ApiError(400, 'Unexpected file field');
        }
        // Generic error
        else {
            error = new ApiError(
                error.statusCode || 500,
                error.message || 'Internal server error'
            );
        }
    }

    // Send error response
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

/**
 * 404 handler
 */
export const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

export default errorHandler;
