/**
 * @fileoverview Validation utilities for AI extraction responses
 */

/**
 * Validate and sanitize numeric value (ensure it's not an expression)
 * @param {any} value - Value to validate
 * @returns {number|null} - Valid number or null
 */
export const sanitizeNumeric = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // If it's already a number, return it
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }

    // If it's a string, check if it contains operators (invalid)
    if (typeof value === 'string') {
        // Remove whitespace
        const trimmed = value.trim();

        // Check for mathematical operators (invalid AI response)
        if (/[+\-*/]/.test(trimmed)) {
            console.warn('Invalid numeric value with operators:', trimmed);
            return null;
        }

        // Try to parse as float
        const parsed = parseFloat(trimmed);
        return isNaN(parsed) ? null : parsed;
    }

    return null;
};

/**
 * Validate Groq extraction response structure
 * @param {any} response - Response from Groq API
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateExtractionResponse = (response) => {
    const errors = [];

    if (!response || typeof response !== 'object') {
        errors.push('Response is not a valid object');
        return { valid: false, errors };
    }

    // Validate invoice object
    if (!response.invoice || typeof response.invoice !== 'object') {
        errors.push('Missing or invalid invoice object');
    } else {
        // Check for invalid numeric fields in invoice
        const numericFields = ['totalAmount', 'tax'];
        numericFields.forEach(field => {
            const value = response.invoice[field];
            if (value !== null && value !== undefined) {
                if (typeof value === 'string' && /[+\-*/]/.test(value)) {
                    errors.push(`Invoice.${field} contains mathematical expression: ${value}`);
                }
            }
        });
    }

    // Validate products array
    if (!Array.isArray(response.products)) {
        errors.push('Products is not an array');
    } else {
        response.products.forEach((product, index) => {
            if (!product || typeof product !== 'object') {
                errors.push(`Product[${index}] is not a valid object`);
                return;
            }

            // Check for invalid numeric fields in products
            const numericFields = ['quantity', 'unitPrice', 'tax', 'priceWithTax'];
            numericFields.forEach(field => {
                const value = product[field];
                if (value !== null && value !== undefined) {
                    if (typeof value === 'string' && /[+\-*/]/.test(value)) {
                        errors.push(`Product[${index}].${field} contains mathematical expression: ${value}`);
                    }
                }
            });
        });
    }

    // Validate customer object
    if (!response.customer || typeof response.customer !== 'object') {
        errors.push('Missing or invalid customer object');
    } else {
        const totalAmount = response.customer.totalPurchaseAmount;
        if (totalAmount !== null && totalAmount !== undefined) {
            if (typeof totalAmount === 'string' && /[+\-*/]/.test(totalAmount)) {
                errors.push(`Customer.totalPurchaseAmount contains mathematical expression: ${totalAmount}`);
            }
        }
    }

    // Validate missingFields
    if (!Array.isArray(response.missingFields)) {
        errors.push('missingFields is not an array');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Sanitize entire extraction response
 * @param {any} response - Response from Groq API
 * @returns {any} - Sanitized response
 */
export const sanitizeExtractionResponse = (response) => {
    if (!response || typeof response !== 'object') {
        return response;
    }

    const sanitized = { ...response };

    // Sanitize invoice numeric fields
    if (sanitized.invoice) {
        sanitized.invoice = {
            ...sanitized.invoice,
            totalAmount: sanitizeNumeric(sanitized.invoice.totalAmount),
            tax: sanitizeNumeric(sanitized.invoice.tax)
        };
    }

    // Sanitize products
    if (Array.isArray(sanitized.products)) {
        sanitized.products = sanitized.products.map(product => ({
            ...product,
            quantity: sanitizeNumeric(product.quantity),
            unitPrice: sanitizeNumeric(product.unitPrice),
            tax: sanitizeNumeric(product.tax),
            priceWithTax: sanitizeNumeric(product.priceWithTax)
        }));
    }

    // Sanitize customer
    if (sanitized.customer) {
        sanitized.customer = {
            ...sanitized.customer,
            totalPurchaseAmount: sanitizeNumeric(sanitized.customer.totalPurchaseAmount)
        };
    }

    return sanitized;
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyError = (error) => {
    const message = error.message || '';

    if (message.includes('API key')) {
        return 'Invalid API key. Please check your configuration.';
    }

    if (message.includes('json_validate_failed')) {
        return 'AI generated invalid data. This usually happens with complex invoices. Please try again or manually enter the data.';
    }

    if (message.includes('length') || message.includes('too long')) {
        return 'Document is too large. Please try a shorter document or extract data manually.';
    }

    if (message.includes('rate limit')) {
        return 'Too many requests. Please wait a moment and try again.';
    }

    if (message.includes('network') || message.includes('fetch')) {
        return 'Network error. Please check your internet connection and try again.';
    }

    return `Extraction failed: ${message}`;
};
