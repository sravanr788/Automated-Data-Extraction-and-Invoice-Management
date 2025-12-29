/**
 * @fileoverview Upload slice for managing file uploads
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    files: {},
    fileIds: [],
    isProcessing: false
};

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        addFile: (state, action) => {
            const file = action.payload;
            state.files[file.id] = file;
            state.fileIds.push(file.id);
        },

        updateFileStatus: (state, action) => {
            const { id, status, progress, error, extractedInvoiceIds } = action.payload;
            const file = state.files[id];

            if (file) {
                if (status !== undefined) file.status = status;
                if (progress !== undefined) file.progress = progress;
                if (error !== undefined) file.error = error;
                if (extractedInvoiceIds !== undefined) file.extractedInvoiceIds = extractedInvoiceIds;
            }
        },

        removeFile: (state, action) => {
            const id = action.payload;
            delete state.files[id];
            state.fileIds = state.fileIds.filter(fileId => fileId !== id);
        },

        setProcessing: (state, action) => {
            state.isProcessing = action.payload;
        },

        clearAllFiles: (state) => {
            state.files = {};
            state.fileIds = [];
            state.isProcessing = false;
        }
    }
});

export const {
    addFile,
    updateFileStatus,
    removeFile,
    setProcessing,
    clearAllFiles
} = uploadSlice.actions;

export default uploadSlice.reducer;
