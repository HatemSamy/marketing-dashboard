import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
    message: {
        type: String,
        trim: true,
    },
    mediaType: {
        type: String,
        required: [true, 'Media type is required'],
        enum: {
            values: ['text', 'image', 'video'],
            message: '{VALUE} is not a valid media type'
        },
        default: 'text'
    },
    mediaUrl: {
        type: String,
        trim: true,
    },
    totalContacts: {
        type: Number,
        required: [true, 'Total contacts is required'],
        min: [0, 'Total contacts cannot be negative'],
        default: 0
    },
    sentCount: {
        type: Number,
        default: 0,
        min: [0, 'Sent count cannot be negative']
    },
    failedCount: {
        type: Number,
        default: 0,
        min: [0, 'Failed count cannot be negative']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'sending', 'completed', 'failed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });

// Virtual for success rate
campaignSchema.virtual('successRate').get(function () {
    if (this.totalContacts === 0) return 0;
    return ((this.sentCount / this.totalContacts) * 100).toFixed(2);
});

// Ensure virtuals are included in JSON
campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;
