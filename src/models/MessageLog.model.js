import mongoose from 'mongoose';

const messageLogSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        index: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true
    },
    direction: {
        type: String,
        required: [true, 'Direction is required'],
        enum: {
            values: ['outgoing', 'incoming'],
            message: '{VALUE} is not a valid direction'
        },
        default: 'outgoing'
    },
    type: {
        type: String,
        enum: {
            values: ['text', 'image', 'video'],
            message: '{VALUE} is not a valid message type'
        },
        default: 'text'
    },
    content: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: ['sent', 'failed', 'delivered', 'read'],
            message: '{VALUE} is not a valid status'
        },
        default: 'sent'
    },
    error: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
messageLogSchema.index({ campaignId: 1, timestamp: -1 });
messageLogSchema.index({ phone: 1, timestamp: -1 });
messageLogSchema.index({ direction: 1, isRead: 1 });

const MessageLog = mongoose.model('MessageLog', messageLogSchema);

export default MessageLog;
