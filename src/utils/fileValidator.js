/**
 * File validation utilities
 */

const ALLOWED_EXTENSIONS = {
    excel: ['.xlsx', '.xls'],
    image: ['.jpg', '.jpeg', '.png', '.gif'],
    video: ['.mp4', '.mov', '.avi', '.mkv']
};

const MAX_FILE_SIZES = {
    excel: 5 * 1024 * 1024,    // 5MB
    image: 10 * 1024 * 1024,   // 10MB
    video: 50 * 1024 * 1024    // 50MB
};

/**
 * Validates file type based on extension
 * @param {string} filename - Name of the file
 * @param {string} type - Type of file (excel, image, video)
 * @returns {boolean} - True if valid
 */
export const isValidFileType = (filename, type) => {
    if (!filename || !type) return false;

    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const allowedExts = ALLOWED_EXTENSIONS[type];

    return allowedExts ? allowedExts.includes(ext) : false;
};

/**
 * Validates file size
 * @param {number} fileSize - Size of file in bytes
 * @param {string} type - Type of file (excel, image, video)
 * @returns {boolean} - True if valid
 */
export const isValidFileSize = (fileSize, type) => {
    if (!fileSize || !type) return false;

    const maxSize = MAX_FILE_SIZES[type];
    return maxSize ? fileSize <= maxSize : false;
};

/**
 * Gets max file size for a type
 * @param {string} type - Type of file
 * @returns {number} - Max size in bytes
 */
export const getMaxFileSize = (type) => {
    return MAX_FILE_SIZES[type] || 0;
};

/**
 * Validates Excel file structure (checks if required columns exist)
 * @param {Array} headers - Array of column headers
 * @returns {boolean} - True if valid
 */
export const validateExcelStructure = (headers) => {
    if (!Array.isArray(headers)) return false;

    // Check if 'phone' column exists (case insensitive)
    return headers.some(header =>
        header && header.toString().toLowerCase().trim() === 'phone'
    );
};
