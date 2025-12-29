/**
 * @fileoverview Customers slice for managing customer data
 */

import { createSlice } from '@reduxjs/toolkit';
import { updateMissingFields } from '../../models/dataModels';

const initialState = {
    byId: {},
    allIds: [],
    loading: false,
    error: null
};

const customersSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        addCustomer: (state, action) => {
            const customer = action.payload;
            state.byId[customer.id] = customer;

            if (!state.allIds.includes(customer.id)) {
                state.allIds.push(customer.id);
            }
        },

        addCustomers: (state, action) => {
            const customers = action.payload;
            customers.forEach(customer => {
                state.byId[customer.id] = customer;
                if (!state.allIds.includes(customer.id)) {
                    state.allIds.push(customer.id);
                }
            });
        },

        updateCustomer: (state, action) => {
            const { id, changes } = action.payload;
            const customer = state.byId[id];

            if (customer) {
                Object.assign(customer, changes);
                customer.lastEditedAt = new Date().toISOString();
                customer.missingFields = updateMissingFields(customer);
            }
        },

        addInvoiceToCustomer: (state, action) => {
            const { customerId, invoiceId } = action.payload;
            const customer = state.byId[customerId];

            if (customer && !customer.invoiceIds.includes(invoiceId)) {
                customer.invoiceIds.push(invoiceId);
            }
        },

        removeInvoiceFromCustomer: (state, action) => {
            const { customerId, invoiceId } = action.payload;
            const customer = state.byId[customerId];

            if (customer) {
                customer.invoiceIds = customer.invoiceIds.filter(id => id !== invoiceId);
            }
        },

        deleteCustomer: (state, action) => {
            const id = action.payload;
            delete state.byId[id];
            state.allIds = state.allIds.filter(customerId => customerId !== id);
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
    addCustomer,
    addCustomers,
    updateCustomer,
    addInvoiceToCustomer,
    removeInvoiceFromCustomer,
    deleteCustomer,
    setLoading,
    setError,
    clearError
} = customersSlice.actions;

export default customersSlice.reducer;

// Selectors
export const selectAllCustomers = (state) =>
    state.customers.allIds.map(id => state.customers.byId[id]);

export const selectCustomerById = (state, customerId) =>
    state.customers.byId[customerId];
