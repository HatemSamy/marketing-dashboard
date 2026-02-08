import MessageLog from '../models/MessageLog.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Get messages with optional filters
 * @route GET /api/messages
 */
export const getMessages = async (req, res, next) => {
    try {
        const { campaignId, phone, direction, page = 1, limit = 50 } = req.query;

        // Build filter object
        const filter = {};

        if (campaignId) {
            filter.campaignId = campaignId;
        }

        if (phone) {
            filter.phone = phone;
        }

        if (direction) {
            if (!['outgoing', 'incoming'].includes(direction)) {
                throw new ApiError(400, 'Direction must be either "outgoing" or "incoming"');
            }
            filter.direction = direction;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get messages with pagination
        const messages = await MessageLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('campaignId', 'mediaType status createdAt')
            .select('-__v');

        // Get total count
        const total = await MessageLog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                messages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
