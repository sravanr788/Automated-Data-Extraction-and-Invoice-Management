/**
 * @fileoverview Date parsing and formatting utilities
 */

/**
 * Parse various date formats and normalize to YYYY-MM-DD
 * @param {string|null} dateStr - Date string in various formats
 * @returns {string|null} - ISO date string (YYYY-MM-DD) or null
 */
export const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') {
        return null;
    }

    const trimmed = dateStr.trim();
    if (!trimmed) {
        return null;
    }

    try {
        // Already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const date = new Date(trimmed);
            return isNaN(date.getTime()) ? null : trimmed;
        }

        // Handle "12 Nov 2024", "12 November 2024", etc.
        const monthNameRegex = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i;
        const monthMatch = trimmed.match(monthNameRegex);
        if (monthMatch) {
            const [, day, month, year] = monthMatch;
            const monthMap = {
                jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
                jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
            };
            const monthNum = monthMap[month.toLowerCase().substring(0, 3)];
            const paddedDay = day.padStart(2, '0');
            return `${year}-${monthNum}-${paddedDay}`;
        }

        // Handle DD/MM/YYYY or MM/DD/YYYY (assume DD/MM/YYYY for international format)
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
            const [part1, part2, year] = trimmed.split('/');
            const day = part1.padStart(2, '0');
            const month = part2.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Handle YYYY/MM/DD
        if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Try native Date parsing as last resort
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        return null;
    } catch (error) {
        console.warn('Date parsing error:', error);
        return null;
    }
};

/**
 * Format date for display
 * @param {string|null} isoDate - ISO date string (YYYY-MM-DD)
 * @returns {string} - Formatted date or empty string
 */
export const formatDateForDisplay = (isoDate) => {
    if (!isoDate) {
        return '';
    }

    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) {
            return isoDate; // Return as-is if invalid
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return isoDate;
    }
};

/**
 * Validate if a string is a valid date
 * @param {string} dateStr - Date string
 * @returns {boolean}
 */
export const isValidDate = (dateStr) => {
    if (!dateStr) {
        return false;
    }
    const parsed = parseDate(dateStr);
    return parsed !== null;
};
