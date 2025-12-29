# Automated Data Extraction and Invoice Management

A React application that leverages AI to automatically extract and structure invoice data from multiple file formats (PDFs, images, Excel), providing an intelligent data entry solution for accounting and invoice management workflows.

## Overview

This application addresses the time-consuming challenge of manual invoice data entry by combining OCR, AI, and intelligent validation to automatically extract structured data from invoices. The system processes uploaded files through a multi-stage pipeline and presents the extracted information in an organized, editable interface.

**Key Capabilities:**
- Multi-format file support (PDF, Excel, Images)
- AI-powered data extraction using Groq LLM
- Automatic validation and error detection
- Real-time progress tracking
- Inline editing with missing field highlights
- Dark/light theme support

## Architecture

### Technology Stack

**Frontend:**
- React with Redux Toolkit for state management
- Vite for fast development and optimized builds
- CSS3 with custom design system

**Core Libraries:**
- **AI/ML**: `groq-sdk` for LLM-based extraction
- **Document Processing**: 
  - `pdfjs-dist` for PDF text extraction
  - `tesseract.js` for OCR on images
  - `xlsx` for Excel file parsing
- **State Management**: `@reduxjs/toolkit`, `react-redux`

### System Architecture

```
File Upload → Detection → Extraction → AI Processing → Validation → Redux Store → UI
```

#### Processing Pipeline

1. **File Upload & Detection**
   - User uploads PDF, image (PNG/JPG), or Excel file
   - File type detection via MIME type analysis

2. **Text Extraction**
   - **PDF**: Direct text extraction using PDF.js
   - **Images**: OCR processing with Tesseract.js (includes image preprocessing)
   - **Excel**: Cell data parsing and text concatenation

3. **AI-Powered Structuring**
   - Raw text sent to Groq AI (llama-3.3-70b-versatile model)
   - Structured extraction into Invoice, Products, and Customer entities
   - Missing field detection

4. **Validation & Sanitization**
   - Validates AI response structure
   - Detects and fixes common issues (mathematical expressions in numeric fields)
   - Date normalization to YYYY-MM-DD format
   - Numeric field sanitization

5. **State Management**
   - Normalized data stored in Redux
   - Relationship tracking between invoices, products, and customers
   - File processing status and progress updates

6. **User Interface**
   - Three synchronized tabs: Invoices, Products, Customers
   - Visual indicators for missing fields
   - Inline editing capabilities
   - Real-time file processing status

### Key Components

```
src/
├── services/
│   ├── ai/groqService.js           # Groq API integration
│   ├── pdf/pdfService.js           # PDF text extraction
│   ├── ocr/ocrService.js           # Tesseract OCR processing
│   ├── excel/excelService.js       # Excel parsing
│   └── extractionOrchestrator.js   # Main pipeline coordinator
├── features/                        # Redux slices
│   ├── invoices/
│   ├── products/
│   ├── customers/
│   ├── upload/
│   └── ui/
├── components/
│   ├── features/                    # Feature-specific components
│   └── common/                      # Reusable UI components
├── utils/
│   ├── validationHelpers.js        # Response validation & sanitization
│   ├── dateHelpers.js              # Date parsing and normalization
│   └── fileHelpers.js              # File type detection
└── pages/
    └── Dashboard.jsx                # Main application page
```

## AI Data Extraction Strategy

### Groq Integration

The application uses **Groq Cloud API** with the `llama-3.3-70b-versatile` model for structured data extraction.

#### Extraction Prompt Engineering

The system uses a carefully crafted prompt that:
1. **Enforces strict output format** using JSON mode
2. **Prevents common AI errors** (mathematical expressions, incorrect date formats)
3. **Handles missing data gracefully** via `missingFields` array
4. **Validates data types** at the prompt level

**Key Prompt Requirements:**
- All numeric fields must be final calculated values (not expressions like "100 + 50")
- Dates must be normalized to YYYY-MM-DD format
- Missing fields explicitly tracked in `missingFields` array
- Strict JSON schema with null fallbacks

#### Response Structure

```json
{
  "invoice": {
    "serialNumber": "INV-12345",
    "date": "2024-11-12",
    "customerName": "Acme Corp",
    "totalAmount": 1500.00,
    "tax": 150.00
  },
  "products": [
    {
      "name": "Product A",
      "quantity": 5,
      "unitPrice": 250.00,
      "tax": 25.00,
      "priceWithTax": 275.00
    }
  ],
  "customer": {
    "name": "Acme Corp",
    "phone": "+1234567890",
    "totalPurchaseAmount": 1500.00
  },
  "missingFields": ["phone"]
}
```

### Error Handling & Recovery

- **Text Length Limiting**: Truncates documents to 6000 characters to prevent token limit errors
- **Response Validation**: Multi-layer validation catches invalid AI responses
- **Sanitization**: Automatically fixes common issues (numeric expressions, type mismatches)
- **User-Friendly Errors**: Converts technical errors to actionable user messages

## Validation Strategy

### Three-Layer Validation

1. **AI-Level Validation** (Prompt-based)
   - Enforces JSON schema via Groq's `response_format: { type: 'json_object' }`
   - Instructs model on data type requirements

2. **Structural Validation** (`validationHelpers.js`)
   - Validates response has required objects (invoice, products, customer)
   - Checks for mathematical expressions in numeric fields
   - Ensures proper data types

3. **Data Sanitization**
   - `sanitizeNumeric()`: Converts strings to numbers, rejects expressions
   - `sanitizeExtractionResponse()`: Applies sanitization to all numeric fields
   - `parseDate()`: Normalizes various date formats to YYYY-MM-DD

### Missing Field Detection

- AI identifies missing fields during extraction
- Fields are highlighted in the UI with visual indicators
- Users can inline-edit to fill missing data
- Last edited timestamp tracked per entity

## Test Cases Validated

The system has been tested against various real-world scenarios located in the `assignment_test_cases` directory:

### Test Case 1: Invoice PDFs
- **File Type**: PDF documents
- **Complexity**: Standard invoice PDFs with typed text
- **Result**: ✅ Successfully extracted all invoice data including serial numbers, dates, line items, and totals

### Test Case 2: Invoice PDF + Images
- **File Type**: Mixed PDFs and scanned images
- **Complexity**: Requires both PDF parsing and OCR
- **Result**: ✅ OCR successfully extracted text from scanned invoices; AI structured the data correctly

### Test Case 3: Excel File (Single)
- **File Type**: Single Excel workbook
- **Complexity**: Tabular data with multiple columns
- **Result**: ✅ Parsed Excel data and extracted structured invoice information

### Test Case 4: Excel Files (Multiple)
- **File Type**: Multiple Excel workbooks
- **Complexity**: Batch processing, varying formats
- **Result**: ✅ Processed multiple files sequentially with progress tracking

### Test Case 5: All Types of Files (Mixed Upload)
- **File Type**: PDFs, Images (PNG/JPG), Excel files uploaded together
- **Complexity**: Comprehensive test of all extraction pipelines
- **Result**: ✅ Successfully detected file types and routed to appropriate extractors

> **Note**: For visual proof and detailed test results, refer to the screenshots and videos in the `assignment_test_cases` folder.

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Groq API key ([Get one free](https://console.groq.com))

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/sravanr788/Automated-Data-Extraction-and-Invoice-Management.git
   cd Automated-Data-Extraction-and-Invoice-Management
   ```

2. **Navigate to client directory**
   ```bash
   cd client
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Groq API key:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

## Usage

1. **Upload Files**: Drag and drop or click to select PDF, image, or Excel files
2. **Monitor Processing**: Watch real-time progress as files are processed
3. **Review Data**: Switch between Invoices, Products, and Customers tabs
4. **Edit Missing Fields**: Click on highlighted fields to edit inline
5. **Theme Toggle**: Switch between light and dark modes

## Acknowledgments

- Groq for providing fast and accurate LLM inference
- Tesseract.js for client-side OCR
- PDF.js for robust PDF parsing