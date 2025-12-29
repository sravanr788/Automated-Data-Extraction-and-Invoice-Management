/**
 * @fileoverview Main dashboard page
 */

import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../features/ui/uiSlice';
import { selectAllInvoices } from '../features/invoices/invoicesSlice';
import { selectAllProducts } from '../features/products/productsSlice';
import { selectAllCustomers } from '../features/customers/customersSlice';
import { TABS } from '../utils/constants';
import Tabs from '../components/common/Tabs';
import FileUpload from '../components/features/upload/FileUpload';
import FileList from '../components/features/upload/FileList';
import InvoiceTable from '../components/features/invoices/InvoiceTable';
import ProductTable from '../components/features/products/ProductTable';
import CustomerTable from '../components/features/customers/CustomerTable';
import './Dashboard.css';

export default function Dashboard() {
    const dispatch = useDispatch();
    const activeTab = useSelector(state => state.ui.activeTab);
    const invoices = useSelector(selectAllInvoices);
    const products = useSelector(selectAllProducts);
    const customers = useSelector(selectAllCustomers);

    const tabs = [
        { id: TABS.INVOICES, label: `Invoices (${invoices.length})` },
        { id: TABS.PRODUCTS, label: `Products (${products.length})` },
        { id: TABS.CUSTOMERS, label: `Customers (${customers.length})` }
    ];

    const handleTabChange = (tabId) => {
        dispatch(setActiveTab(tabId));
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Invoice Management System</h1>
                <p>AI-powered data extraction from invoices, PDFs, Excel, and images</p>
            </header>

            <main className="main-content">
                <FileUpload />
                <FileList />

                <div className="data-section">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />

                    {activeTab === TABS.INVOICES && <InvoiceTable invoices={invoices} />}
                    {activeTab === TABS.PRODUCTS && <ProductTable products={products} />}
                    {activeTab === TABS.CUSTOMERS && <CustomerTable customers={customers} />}
                </div>
            </main>
        </div>
    );
}
