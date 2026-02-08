import xlsx from 'xlsx';
import fs from 'fs';
import { validateAndNormalize } from '../utils/phoneValidator.js';
import { validateExcelStructure } from '../utils/fileValidator.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Excel Processing Service
 */

/**
 * Parse Excel file and extract phone numbers
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Array<string>>} - Array of validated phone numbers
 */
const parseExcelFile = async (filePath) => {
    try {
        logger.info(`Parsing Excel file: ${filePath}`);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new ApiError(400, 'Excel file not found');
        }

        // Read the Excel file
        const workbook = xlsx.readFile(filePath);

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new ApiError(400, 'Excel file has no sheets');
        }

        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const data = xlsx.utils.sheet_to_json(sheet, {
            raw: false, // Treat all values as strings
            defval: '' // Default value for empty cells
        });

        if (!data || data.length === 0) {
            throw new ApiError(400, 'Excel file is empty');
        }

        // Validate Excel structure (check for phone column)
        const headers = Object.keys(data[0]);
        if (!validateExcelStructure(headers)) {
            throw new ApiError(
                400,
                'Excel file must contain a "phone" column. Found columns: ' + headers.join(', ')
            );
        }

        // Extract and validate phone numbers
        const phoneNumbers = extractPhoneNumbers(data);

        logger.info(`Extracted ${phoneNumbers.length} valid phone numbers from Excel`);

        // Clean up - delete the file after processing
        deleteFile(filePath);

        return phoneNumbers;
    } catch (error) {
        // Clean up file even on error
        deleteFile(filePath);

        if (error instanceof ApiError) {
            throw error;
        }

        logger.error('Error parsing Excel file:', error);
        throw new ApiError(500, `Failed to parse Excel file: ${error.message}`);
    }
};

/**
 * Extract and validate phone numbers from parsed data
 * @param {Array<Object>} data - Parsed Excel data
 * @returns {Array<string>} - Array of unique, validated phone numbers
 */
const extractPhoneNumbers = (data) => {
    const phoneNumbers = new Set(); // Use Set to remove duplicates
    const invalidNumbers = [];

    data.forEach((row, index) => {
        // Try to find phone column (case insensitive)
        const phoneKey = Object.keys(row).find(
            key => key.toLowerCase().trim() === 'phone'
        );

        if (!phoneKey) {
            return; // Skip this row
        }

        const phoneValue = row[phoneKey];

        if (!phoneValue || phoneValue.toString().trim() === '') {
            return; // Skip empty values
        }

        // Validate and normalize
        const normalized = validateAndNormalize(phoneValue.toString().trim());

        if (normalized) {
            phoneNumbers.add(normalized);
        } else {
            invalidNumbers.push({
                row: index + 2, // +2 because: +1 for header, +1 for 0-index
                value: phoneValue
            });
        }
    });

    // Log invalid numbers if any
    if (invalidNumbers.length > 0) {
        logger.warn(`Found ${invalidNumbers.length} invalid phone numbers:`,
            invalidNumbers.slice(0, 5) // Log first 5
        );
    }

    const uniqueNumbers = Array.from(phoneNumbers);

    if (uniqueNumbers.length === 0) {
        throw new ApiError(400, 'No valid phone numbers found in Excel file');
    }

    return uniqueNumbers;
};

/**
 * Delete file safely
 * @param {string} filePath - Path to file
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.debug(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        logger.error(`Failed to delete file ${filePath}:`, error.message);
    }
};

// Export service methods
export default {
    parseExcelFile
};
