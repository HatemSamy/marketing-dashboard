/**
 * Phone number validation and normalization utilities
 */

/**
 * Validates if a phone number is in a valid format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhoneNumber = (phone) => {
    if (!phone || typeof phone !== 'string') return false;

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Valid phone numbers should have between 10 and 15 digits
    return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Normalizes phone number to international format (E.164)
 * @param {string} phone - Phone number to normalize
 * @returns {string} - Normalized phone number with + prefix
 */
export const normalizePhoneNumber = (phone) => {
    if (!phone) return '';

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If doesn't start with country code, assume it needs one
    // Note: You may want to add default country code logic here
    if (!phone.startsWith('+') && !cleaned.startsWith('1') && !cleaned.startsWith('2')) {
        // This is a placeholder - adjust based on your target country
        // For now, we'll just add + if missing
    }

    // Ensure it starts with +
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

/**
 * Removes invalid characters from phone number
 * @param {string} phone - Phone number to clean
 * @returns {string} - Cleaned phone number
 */
export const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Validates and normalizes a phone number
 * @param {string} phone - Phone number to process
 * @returns {string|null} - Normalized phone number or null if invalid
 */
export const validateAndNormalize = (phone) => {
    const cleaned = cleanPhoneNumber(phone);
    if (!isValidPhoneNumber(cleaned)) {
        return null;
    }
    return normalizePhoneNumber(cleaned);
};
