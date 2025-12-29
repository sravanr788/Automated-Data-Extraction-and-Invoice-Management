/**
 * @fileoverview Groq AI service for structured invoice data extraction
 */

import Groq from 'groq-sdk';
import { CONFIG } from '../../utils/constants';

/**
 * Initialize Groq client
 */
const groq = new Groq({
    apiKey: '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',
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

    const prompt = `You are an AI system that extracts structured invoice data from raw text.

**CRITICAL RULES - READ CAREFULLY:**

1. **Numbers Only**: ALL numeric fields (totalAmount, tax, quantity, unitPrice, priceWithTax, totalPurchaseAmount) MUST be final calculated numbers. NEVER use mathematical expressions like "11486.11 + 11486.11 + 3139.33". Calculate the sum and return the final number.

2. **Date Formatting**: Parse dates to YYYY-MM-DD format. Examples:
   - "12 Nov 2024" → "2024-11-12"
   - "November 12, 2024" → "2024-11-12"
   - "12/11/2024" → "2024-11-12"

3. **Required Fields**: These fields are REQUIRED for each entity:
   - Invoice: serialNumber, date, customerName, totalAmount, tax
   - Product: name, quantity, unitPrice, tax, priceWithTax
   - Customer: name, phone, totalPurchaseAmount

4. **Missing Values**: If a field is not found in the text, set it to null and add the field name to the missingFields array.

**Output Format (Valid JSON ONLY):**

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

**Examples:**

WRONG: "tax": 11486.11 + 11486.11 + 3139.33
RIGHT: "tax": 26111.55

WRONG: "date": "12 Nov 2024"
RIGHT: "date": "2024-11-12"

WRONG: "quantity": "5 units"
RIGHT: "quantity": 5

**Invoice Text:**
${truncatedText}

**Remember**: Return ONLY valid JSON. No markdown code blocks, no explanations, no comments. All numbers must be calculated final values, not expressions.`;

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
