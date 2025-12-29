/**
 * @fileoverview Groq AI service for structured invoice data extraction
 */

import Groq from 'groq-sdk';
import { CONFIG } from '../../utils/constants';

/**
 * Initialize Groq client
 */
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

/**
 * Extract structured invoice data using Groq AI
 * Uses the exact prompt structure specified by the user
 * @param {string} rawText - Raw extracted text from invoice
 * @returns {Promise<import('../../models/dataModels').GroqExtractionResponse>}
 */
export const extractInvoiceData = async (rawText) => {
    // Truncate text if too long to prevent token limit errors
    // Groq models typically support ~8k tokens, leaving room for prompt + response
    const MAX_TEXT_LENGTH = 6000;
    const truncatedText = rawText.length > MAX_TEXT_LENGTH
        ? rawText.substring(0, MAX_TEXT_LENGTH) + '\n\n[... text truncated due to length ...]'
        : rawText;

    const prompt = `You are an AI system that extracts structured invoice data.

Input:
Unstructured text extracted from invoices (OCR or Excel).

Your task:
Return ONLY valid JSON in the following format:

{
  "invoice": {
    "serialNumber": string | null,
    "date": string | null,
    "customerName": string | null,
    "totalAmount": number | null,
    "tax": number | null
  },
  "products": [
    {
      "name": string | null,
      "quantity": number | null,
      "unitPrice": number | null,
      "tax": number | null,
      "priceWithTax": number | null
    }
  ],
  "customer": {
    "name": string | null,
    "phone": string | null,
    "totalPurchaseAmount": number | null
  },
  "missingFields": string[]
}

Rules:
- Do NOT guess or hallucinate values
- If a field is missing, return null
- Add missing field names to missingFields
- Output JSON only (no markdown, no explanation)

Invoice Text:
${truncatedText}`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: CONFIG.GROQ_MODEL,
            temperature: CONFIG.GROQ_TEMPERATURE,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Validate structure
        if (!parsed.invoice || !parsed.products || !parsed.customer) {
            throw new Error('Invalid response structure from Groq API');
        }

        return parsed;
    } catch (error) {
        console.error('Groq extraction error:', error);

        if (error.message.includes('API key')) {
            throw new Error('Invalid Groq API key. Please check your .env file.');
        }

        // Provide more helpful error messages
        if (error.status === 400 && error.message.includes('length')) {
            throw new Error('Document too long for AI processing. Please try a shorter document.');
        }

        throw new Error(`AI extraction failed: ${error.status || ''} ${error.message}`);
    }
};

/**
 * Test Groq API connection
 * @returns {Promise<boolean>}
 */
export const testGroqConnection = async () => {
    try {
        const testPrompt = 'Return JSON: {"status": "ok"}';
        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: testPrompt }],
            model: CONFIG.GROQ_MODEL,
            temperature: 0,
            response_format: { type: 'json_object' }
        });

        return response.choices[0].message.content.includes('ok');
    } catch (error) {
        console.error('Groq connection test failed:', error);
        return false;
    }
};
