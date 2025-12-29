/**
 * @fileoverview Utility functions for file handling and validation
 */

/**
 * Allowed file types for upload
 */
export const ALLOWED_FILE_TYPES = {
    PDF: 'application/pdf',
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    JPG: 'image/jpg',
    EXCEL: 'application/vnd.ms-excel',
    EXCEL_MODERN: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate uploaded file
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateFile = (file) => {
    const allowedTypes = Object.values(ALLOWED_FILE_TYPES);

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload PDF, Excel, or Image files.'
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'File too large. Maximum size is 10MB.'
        };
    }

    return { valid: true, error: null };
};

/**
 * Detect file type category
 * @param {string} mimeType
 * @returns {'pdf'|'image'|'excel'|'unknown'}
 */
export const detectFileType = (mimeType) => {
    if (mimeType === ALLOWED_FILE_TYPES.PDF) return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'excel';
    return 'unknown';
};

/**
 * Format file size for display
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
