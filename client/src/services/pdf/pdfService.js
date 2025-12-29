/**
 * @fileoverview PDF text extraction service using pdfjs-dist
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF file
 * @param {File} file - PDF file
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');

            fullText += pageText + '\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};

/**
 * Check if PDF contains images (might need OCR)
 * @param {File} file - PDF file
 * @returns {Promise<boolean>}
 */
export const isPDFScanned = async (file) => {
    try {
        const text = await extractTextFromPDF(file);
        // If extracted text is very short, likely a scanned PDF
        return text.length < 100;
    } catch (error) {
        return true; // Assume scanned if error
    }
};
