/**
 * @fileoverview Constants used throughout the application
 */

/**
 * Application configuration
 */
export const CONFIG = {
    GROQ_MODEL: 'llama-3.3-70b-versatile',
    GROQ_TEMPERATURE: 0.1,
    OCR_LANGUAGE: 'eng',
    MAX_RETRIES: 3,
    TIMEOUT: 30000
};

/**
 * Tab identifiers
 */
export const TABS = {
    INVOICES: 'invoices',
    PRODUCTS: 'products',
    CUSTOMERS: 'customers'
};

/**
 * File processing statuses
 */
export const FILE_STATUS = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error'
};

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};
