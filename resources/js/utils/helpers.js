/**
 * Shared Utility Functions
 */

/**
 * Generates a deterministic 6-character abbreviation from a numeric ID.
 * Used for creating visual IDs like LHN-XXXXXX or KBN-XXXXXX.
 * 
 * @param {number} id - The original database ID
 * @returns {string} - A 6-character alphanumeric string
 */
export const generateIdAbbrev = (id) => {
    if (!id) return 'XXXXXX';
    
    // Deterministic hashing algorithm to ensure same ID always gives same output
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    // Use a standard multiplier and salt to make it look random but deterministic
    let n = id * 1234567 + 987654;
    
    for (let i = 0; i < 6; i++) { 
        result += chars[n % chars.length]; 
        n = Math.floor(n / chars.length) + id * 31; 
    }
    
    return result;
};
