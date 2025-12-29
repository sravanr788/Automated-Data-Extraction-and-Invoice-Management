/**
 * @fileoverview UI slice for managing application UI state
 */

import { createSlice } from '@reduxjs/toolkit';
import { TABS } from '../../utils/constants';

const initialState = {
    activeTab: TABS.INVOICES,
    selectedInvoiceId: null,
    selectedProductId: null,
    selectedCustomerId: null,
    modals: {
        invoiceEdit: { isOpen: false, id: null },
        productEdit: { isOpen: false, id: null },
        customerEdit: { isOpen: false, id: null }
    },
    notifications: []
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },

        setSelectedInvoice: (state, action) => {
            state.selectedInvoiceId = action.payload;
        },

        setSelectedProduct: (state, action) => {
            state.selectedProductId = action.payload;
        },

        setSelectedCustomer: (state, action) => {
            state.selectedCustomerId = action.payload;
        },

        openModal: (state, action) => {
            const { modalType, id } = action.payload;
            state.modals[modalType] = { isOpen: true, id };
        },

        closeModal: (state, action) => {
            const modalType = action.payload;
            state.modals[modalType] = { isOpen: false, id: null };
        },

        addNotification: (state, action) => {
            const notification = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                ...action.payload
            };
            state.notifications.push(notification);
        },

        removeNotification: (state, action) => {
            const id = action.payload;
            state.notifications = state.notifications.filter(n => n.id !== id);
        },

        clearNotifications: (state) => {
            state.notifications = [];
        }
    }
});

export const {
    setActiveTab,
    setSelectedInvoice,
    setSelectedProduct,
    setSelectedCustomer,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearNotifications
} = uiSlice.actions;

export default uiSlice.reducer;
