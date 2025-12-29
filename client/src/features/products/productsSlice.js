/**
 * @fileoverview Products slice for managing product data
 */

import { createSlice } from '@reduxjs/toolkit';
import { updateMissingFields } from '../../models/dataModels';

const initialState = {
    byId: {},
    allIds: [],
    loading: false,
    error: null
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        addProduct: (state, action) => {
            const product = action.payload;
            state.byId[product.id] = product;

            if (!state.allIds.includes(product.id)) {
                state.allIds.push(product.id);
            }
        },

        addProducts: (state, action) => {
            const products = action.payload;
            products.forEach(product => {
                state.byId[product.id] = product;
                if (!state.allIds.includes(product.id)) {
                    state.allIds.push(product.id);
                }
            });
        },

        updateProduct: (state, action) => {
            const { id, changes } = action.payload;
            const product = state.byId[id];

            if (product) {
                Object.assign(product, changes);
                product.lastEditedAt = new Date().toISOString();
                product.missingFields = updateMissingFields(product);
            }
        },

        deleteProduct: (state, action) => {
            const id = action.payload;
            delete state.byId[id];
            state.allIds = state.allIds.filter(productId => productId !== id);
        },

        deleteProductsByInvoiceId: (state, action) => {
            const invoiceId = action.payload;
            const productIdsToDelete = state.allIds.filter(
                id => state.byId[id].invoiceId === invoiceId
            );

            productIdsToDelete.forEach(id => {
                delete state.byId[id];
            });

            state.allIds = state.allIds.filter(
                id => !productIdsToDelete.includes(id)
            );
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
    addProduct,
    addProducts,
    updateProduct,
    deleteProduct,
    deleteProductsByInvoiceId,
    setLoading,
    setError,
    clearError
} = productsSlice.actions;

export default productsSlice.reducer;

// Selectors
export const selectAllProducts = (state) =>
    state.products.allIds.map(id => state.products.byId[id]);

export const selectProductById = (state, productId) =>
    state.products.byId[productId];

export const selectProductsByInvoiceId = (state, invoiceId) =>
    state.products.allIds
        .map(id => state.products.byId[id])
        .filter(product => product.invoiceId === invoiceId);
