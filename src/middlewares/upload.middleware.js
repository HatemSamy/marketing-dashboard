import upload from '../../config/multer.js';

/**
 * Middleware for handling multipart form data with Excel and media files
 */
export const uploadCampaignFiles = upload.fields([
    { name: 'excelFile', maxCount: 1 },
    { name: 'mediaFile', maxCount: 1 }
]);
