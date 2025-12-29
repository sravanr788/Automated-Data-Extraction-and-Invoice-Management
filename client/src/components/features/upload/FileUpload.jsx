/**
 * @fileoverview File upload component
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { validateFile } from '../../../utils/fileHelpers';
import { addFile } from '../../../features/upload/uploadSlice';
import { processFile } from '../../../services/extractionOrchestrator';
import './FileUpload.css';

export default function FileUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const dispatch = useDispatch();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        files.forEach(file => {
            const validation = validateFile(file);

            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            const fileId = uuidv4();

            // Add file to Redux
            dispatch(addFile({
                id: fileId,
                name: file.name,
                type: file.type,
                size: file.size,
                status: 'uploading',
                progress: 0,
                error: null,
                extractedInvoiceIds: [],
                uploadedAt: new Date().toISOString()
            }));

            // Start processing
            processFile(file, fileId, dispatch);
        });
    };

    return (
        <div
            className={`upload-container ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
            </div>

            <h3>Upload Invoice Files</h3>
            <p>Drag and drop files here or click to browse</p>
            <p className="file-types">PDF, Excel, or Image files (max 10MB)</p>

            <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                onChange={handleFileInput}
                className="file-input"
            />
        </div>
    );
}
