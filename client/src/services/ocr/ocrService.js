/**
 * @fileoverview OCR service using Tesseract.js for image text extraction
 */

import { createWorker } from 'tesseract.js';
import { CONFIG } from '../../utils/constants';

/**
 * Perform OCR on image file
 * @param {File|Blob} imageFile - Image file or blob
 * @param {Function} [progressCallback] - Optional progress callback
 * @returns {Promise<string>} Extracted text
 */
export const performOCR = async (imageFile, progressCallback = null) => {
    const worker = await createWorker(CONFIG.OCR_LANGUAGE, 1, {
        logger: progressCallback ? (m) => {
            if (m.status === 'recognizing text') {
                progressCallback(Math.round(m.progress * 100));
            }
        } : undefined
    });

    try {
        const { data: { text } } = await worker.recognize(imageFile);
        return text.trim();
    } catch (error) {
        console.error('OCR error:', error);
        throw new Error(`OCR failed: ${error.message}`);
    } finally {
        await worker.terminate();
    }
};

/**
 * Preprocess image for better OCR accuracy
 * @param {File} imageFile
 * @returns {Promise<Blob>}
 */
export const preprocessImage = async (imageFile) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Convert to grayscale and increase contrast
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // Grayscale
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

                // Increase contrast
                const contrast = 1.5;
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                const adjusted = factor * (avg - 128) + 128;

                data[i] = adjusted;     // R
                data[i + 1] = adjusted; // G
                data[i + 2] = adjusted; // B
            }

            ctx.putImageData(imageData, 0, 0);

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to preprocess image'));
                }
            }, 'image/png');
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(imageFile);
    });
};
