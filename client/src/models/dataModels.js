/**
 * @fileoverview Data models for Invoice Management System
 * Matches exact Groq API output structure
 */

/**
 * Invoice entity from Groq extraction
 * @typedef {Object} Invoice
 * @property {string} id - Unique identifier (UUID)
 * @property {string|null} serialNumber - Invoice serial/number
 * @property {string|null} date - Invoice date
 * @property {string|null} customerName - Customer name from invoice
 * @property {number|null} totalAmount - Total invoice amount
 * @property {number|null} tax - Tax amount
 * @property {string} customerId - Foreign key to Customer entity
 * @property {string[]} productIds - Array of foreign keys to Product entities
 * @property {string[]} missingFields - Fields that were null in extraction
 * @property {string} sourceFileId - ID of uploaded file
 * @property {string|null} lastEditedAt - ISO timestamp of last edit
 */

/**
 * Product/Line item from Groq extraction
 * @typedef {Object} Product
 * @property {string} id - Unique identifier (UUID)
 * @property {string|null} name - Product name
 * @property {number|null} quantity - Quantity ordered
 * @property {number|null} unitPrice - Price per unit
 * @property {number|null} tax - Tax amount for this product
 * @property {number|null} priceWithTax - Total price including tax
 * @property {string} invoiceId - Foreign key to parent Invoice
 * @property {string[]} missingFields - Fields that were null in extraction
 * @property {string|null} lastEditedAt - ISO timestamp of last edit
 */

/**
 * Customer entity from Groq extraction
 * @typedef {Object} Customer
 * @property {string} id - Unique identifier (UUID)
 * @property {string|null} name - Customer name
 * @property {string|null} phone - Customer phone number
 * @property {number|null} totalPurchaseAmount - Total amount from Groq extraction
 * @property {string[]} invoiceIds - Array of foreign keys to associated Invoices
 * @property {string[]} missingFields - Fields that were null in extraction
 * @property {string|null} lastEditedAt - ISO timestamp of last edit
 */

/**
 * Uploaded file entity for tracking processing status
 * @typedef {Object} UploadedFile
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Original filename
 * @property {string} type - MIME type
 * @property {number} size - File size in bytes
 * @property {('idle'|'uploading'|'processing'|'completed'|'error')} status - Processing status
 * @property {number} progress - Progress percentage (0-100)
 * @property {string|null} error - Error message if status is 'error'
 * @property {string[]} extractedInvoiceIds - IDs of invoices extracted from this file
 * @property {string} uploadedAt - ISO timestamp of upload
 */

/**
 * Raw Groq API response structure
 * @typedef {Object} GroqExtractionResponse
 * @property {Object} invoice - Invoice data
 * @property {string|null} invoice.serialNumber
 * @property {string|null} invoice.date
 * @property {string|null} invoice.customerName
 * @property {number|null} invoice.totalAmount
 * @property {number|null} invoice.tax
 * @property {Array<Object>} products - Products array
 * @property {string|null} products[].name
 * @property {number|null} products[].quantity
 * @property {number|null} products[].unitPrice
 * @property {number|null} products[].tax
 * @property {number|null} products[].priceWithTax
 * @property {Object} customer - Customer data
 * @property {string|null} customer.name
 * @property {string|null} customer.phone
 * @property {number|null} customer.totalPurchaseAmount
 * @property {string[]} missingFields - Array of missing field names
 */

/**
 * Check if a value is null, undefined, or empty string
 * @param {any} value
 * @returns {boolean}
 */
export const isMissing = (value) => {
  return value === null || value === undefined || value === '';
};

/**
 * Get all missing field names from an object
 * @param {Object} obj
 * @param {string[]} excludeKeys - Keys to exclude from check
 * @returns {string[]}
 */
export const getMissingFields = (obj, excludeKeys = ['id', 'lastEditedAt']) => {
  return Object.keys(obj)
    .filter(key => !excludeKeys.includes(key))
    .filter(key => isMissing(obj[key]));
};

/**
 * Update missing fields array after edit
 * @param {Object} entity
 * @returns {string[]}
 */
export const updateMissingFields = (entity) => {
  const excludeKeys = ['id', 'missingFields', 'lastEditedAt', 'invoiceIds', 'productIds', 'sourceFileId', 'invoiceId', 'customerId'];
  return getMissingFields(entity, excludeKeys);
};

// Export empty object to make this a module
export {};
