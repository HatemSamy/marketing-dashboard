import multer from 'multer';
import ApiError from '../src/utils/ApiError.js';

/**
 * Multer configuration for serverless environment (Vercel)
 * Uses memory storage since serverless environments have read-only file systems
 * Files are temporarily stored in memory, then uploaded to Cloudinary
 */

// Use memory storage (files stored as Buffer in memory)
const storage = multer.memoryStorage();

// File filter for validation
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'excelFile') {
        // Accept Excel files only
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new ApiError(400, 'Only Excel files (.xlsx, .xls) are allowed for contact lists'), false);
        }
    } else if (file.fieldname === 'mediaFile') {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new ApiError(400, 'Only image and video files are allowed for media'), false);
        }
    } else {
        cb(new ApiError(400, 'Unexpected field'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max (for videos)
    }
});

export default upload;

