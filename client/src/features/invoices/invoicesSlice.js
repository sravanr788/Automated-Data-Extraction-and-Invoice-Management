/**
 * @fileoverview Invoices slice for managing invoice data
 */

import { createSlice } from '@reduxjs/toolkit';
import { updateMissingFields } from '../../models/dataModels';

const initialState = {
    byId: {},
    allIds: [],
    loading: false,
    error: null
};

const invoicesSlice = createSlice({
    name: 'invoices',
    initialState,
    reducers: {
        addInvoice: (state, action) => {
            const invoice = action.payload;
            state.byId[invoice.id] = invoice;

            if (!state.allIds.includes(invoice.id)) {
                state.allIds.push(invoice.id);
            }
        },

        addInvoices: (state, action) => {
            const invoices = action.payload;
            invoices.forEach(invoice => {
                state.byId[invoice.id] = invoice;
                if (!state.allIds.includes(invoice.id)) {
                    state.allIds.push(invoice.id);
                }
            });
        },

        updateInvoice: (state, action) => {
            const { id, changes } = action.payload;
            const invoice = state.byId[id];

            if (invoice) {
                Object.assign(invoice, changes);
                invoice.lastEditedAt = new Date().toISOString();
                invoice.missingFields = updateMissingFields(invoice);
            }
        },

        deleteInvoice: (state, action) => {
            const id = action.payload;
            delete state.byId[id];
            state.allIds = state.allIds.filter(invoiceId => invoiceId !== id);
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    addInvoice,
    addInvoices,
    updateInvoice,
    deleteInvoice,
    setLoading,
    setError,
    clearError
} = invoicesSlice.actions;

export default invoicesSlice.reducer;

// Selectors
export const selectAllInvoices = (state) =>
    state.invoices.allIds.map(id => state.invoices.byId[id]);

export const selectInvoiceById = (state, invoiceId) =>
    state.invoices.byId[invoiceId];
