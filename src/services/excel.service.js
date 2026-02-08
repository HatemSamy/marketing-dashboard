import xlsx from 'xlsx';
import { validateAndNormalize } from '../utils/phoneValidator.js';
import { validateExcelStructure } from '../utils/fileValidator.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Excel Processing Service for Serverless Environment
 * Works with Buffer instead of file paths
 */

/**
 * Parse Excel file from Buffer and extract phone numbers
 * @param {Buffer} buffer - Excel file buffer from multer memory storage
 * @returns {Promise<Array<string>>} - Array of validated phone numbers
 */
const parseExcelFile = async (buffer) => {
    try {
        logger.info('Parsing Excel file from buffer');

        // Read the Excel file from buffer
        const workbook = xlsx.read(buffer, { type: 'buffer' });

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

        return phoneNumbers;
    } catch (error) {
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

// Export service methods
export default {
    parseExcelFile
};

