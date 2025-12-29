/**
 * @fileoverview Redux store configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import uploadReducer from '../features/upload/uploadSlice';
import invoicesReducer from '../features/invoices/invoicesSlice';
import productsReducer from '../features/products/productsSlice';
import customersReducer from '../features/customers/customersSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
    reducer: {
        upload: uploadReducer,
        invoices: invoicesReducer,
        products: productsReducer,
        customers: customersReducer,
        ui: uiReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for non-serializable checks
                ignoredActions: ['upload/addFile'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.file'],
                // Ignore these paths in the state
                ignoredPaths: ['upload.files']
            }
        })
});
