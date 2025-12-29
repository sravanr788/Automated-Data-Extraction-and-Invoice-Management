/**
 * @fileoverview Main extraction orchestrator that coordinates the entire pipeline
 * File Upload → PDF/OCR/Excel → Groq AI → Redux
 */

import { v4 as uuidv4 } from 'uuid';
import { detectFileType } from '../utils/fileHelpers';
import { extractTextFromPDF } from '../services/pdf/pdfService';
import { performOCR, preprocessImage } from '../services/ocr/ocrService';
import { parseExcelFile } from '../services/excel/excelService';
import { extractInvoiceData } from '../services/ai/groqService';
import { addInvoice } from '../features/invoices/invoicesSlice';
import { addProducts } from '../features/products/productsSlice';
import { addCustomer } from '../features/customers/customersSlice';
import { updateFileStatus } from '../features/upload/uploadSlice';
import { addNotification } from '../features/ui/uiSlice';
import { NOTIFICATION_TYPES } from '../utils/constants';

/**
 * Process uploaded file through complete extraction pipeline
 * @param {File} file - Uploaded file
 * @param {string} fileId - UUID for tracking
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<void>}
 */
export const processFile = async (file, fileId, dispatch) => {
    try {
        // Step 1: Extract raw text based on file type
        dispatch(updateFileStatus({
            id: fileId,
            status: 'processing',
            progress: 10
        }));

        let rawText = '';
        const fileType = detectFileType(file.type);

        if (fileType === 'pdf') {
            rawText = await extractTextFromPDF(file);
        } else if (fileType === 'image') {
            const preprocessed = await preprocessImage(file);
            dispatch(updateFileStatus({ id: fileId, progress: 30 }));
            rawText = await performOCR(preprocessed, (progress) => {
                dispatch(updateFileStatus({ id: fileId, progress: 30 + (progress * 0.3) }));
            });
        } else if (fileType === 'excel') {
            rawText = await parseExcelFile(file);
        } else {
            throw new Error('Unsupported file type');
        }

        if (!rawText || rawText.trim().length === 0) {
            throw new Error('No text could be extracted from the file');
        }

        dispatch(updateFileStatus({ id: fileId, progress: 60 }));

        // Step 2: Send to Groq AI for structured extraction
        const extracted = await extractInvoiceData(rawText);

        dispatch(updateFileStatus({ id: fileId, progress: 80 }));

        // Step 3: Normalize and dispatch to Redux
        await normalizeAndDispatch(extracted, fileId, dispatch);

        // Step 4: Mark as completed
        dispatch(updateFileStatus({
            id: fileId,
            status: 'completed',
            progress: 100
        }));

        dispatch(addNotification({
            type: NOTIFICATION_TYPES.SUCCESS,
            message: `Successfully processed ${file.name}`
        }));

    } catch (error) {
        console.error('File processing error:', error);

        dispatch(updateFileStatus({
            id: fileId,
            status: 'error',
            error: error.message
        }));

        dispatch(addNotification({
            type: NOTIFICATION_TYPES.ERROR,
            message: `Failed to process ${file.name}: ${error.message}`
        }));
    }
};

/**
 * Normalize Groq extraction response and dispatch to Redux
 * @param {import('../models/dataModels').GroqExtractionResponse} extracted
 * @param {string} fileId
 * @param {Function} dispatch
 */
const normalizeAndDispatch = async (extracted, fileId, dispatch) => {
    // Generate IDs
    const invoiceId = uuidv4();
    const customerId = uuidv4();
    const productIds = extracted.products.map(() => uuidv4());

    // Normalize customer
    const customer = {
        id: customerId,
        name: extracted.customer.name,
        phone: extracted.customer.phone,
        totalPurchaseAmount: extracted.customer.totalPurchaseAmount,
        invoiceIds: [invoiceId],
        missingFields: getFieldMissingFlags(extracted.customer, extracted.missingFields),
        lastEditedAt: null
    };

    // Normalize products
    const products = extracted.products.map((prod, idx) => ({
        id: productIds[idx],
        name: prod.name,
        quantity: prod.quantity,
        unitPrice: prod.unitPrice,
        tax: prod.tax,
        priceWithTax: prod.priceWithTax,
        invoiceId,
        missingFields: getFieldMissingFlags(prod, extracted.missingFields),
        lastEditedAt: null
    }));

    // Normalize invoice
    const invoice = {
        id: invoiceId,
        serialNumber: extracted.invoice.serialNumber,
        date: extracted.invoice.date,
        customerName: extracted.invoice.customerName,
        totalAmount: extracted.invoice.totalAmount,
        tax: extracted.invoice.tax,
        customerId,
        productIds,
        missingFields: getFieldMissingFlags(extracted.invoice, extracted.missingFields),
        sourceFileId: fileId,
        lastEditedAt: null
    };

    // Dispatch all entities
    dispatch(addCustomer(customer));
    dispatch(addProducts(products));
    dispatch(addInvoice(invoice));

    // Update file with extracted invoice ID
    dispatch(updateFileStatus({
        id: fileId,
        extractedInvoiceIds: [invoiceId]
    }));
};

/**
 * Extract missing field flags for a specific entity from global missing fields array
 * @param {Object} entity - The entity object
 * @param {string[]} globalMissingFields - Array from Groq response
 * @returns {string[]}
 */
const getFieldMissingFlags = (entity, globalMissingFields) => {
    const entityFields = Object.keys(entity);
    return entityFields.filter(field =>
        entity[field] === null ||
        entity[field] === undefined ||
        globalMissingFields.includes(field)
    );
};
