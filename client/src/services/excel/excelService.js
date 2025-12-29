/**
 * @fileoverview Excel file parsing service using xlsx library
 */

import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract data
 * @param {File} file - Excel file (XLS or XLSX)
 * @returns {Promise<string>} Formatted text from all sheets
 */
export const parseExcelFile = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        let allText = '';

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON with header normalization
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1, // Use array of arrays
                defval: '', // Default value for empty cells
                blankrows: false // Skip blank rows
            });

            if (jsonData.length > 0) {
                allText += `\n=== Sheet: ${sheetName} ===\n`;

                // Normalize headers (first row)
                const headers = jsonData[0].map(h =>
                    String(h).toLowerCase().trim().replace(/\s+/g, '_')
                );

                allText += headers.join(' | ') + '\n';
                allText += '-'.repeat(50) + '\n';

                // Add data rows
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const rowText = row.map(cell => {
                        // Handle empty cells safely
                        if (cell === null || cell === undefined || cell === '') {
                            return 'N/A';
                        }
                        return String(cell);
                    }).join(' | ');

                    allText += rowText + '\n';
                }
            }
        });

        return allText.trim();
    } catch (error) {
        console.error('Excel parsing error:', error);
        throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
};

/**
 * Extract structured data from Excel (alternative format)
 * @param {File} file
 * @returns {Promise<Object[]>} Array of row objects
 */
export const parseExcelToJSON = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const allData = [];

        workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON with normalized headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                defval: null,
                blankrows: false
            });

            // Normalize keys
            const normalizedData = jsonData.map(row => {
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
                    normalizedRow[normalizedKey] = row[key];
                });
                return normalizedRow;
            });

            allData.push(...normalizedData);
        });

        return allData;
    } catch (error) {
        console.error('Excel to JSON error:', error);
        throw new Error(`Failed to parse Excel to JSON: ${error.message}`);
    }
};
