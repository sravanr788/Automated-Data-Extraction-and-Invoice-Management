/**
 * @fileoverview Invoice table component with inline editing
 */

import { useDispatch, useSelector } from 'react-redux';
import { updateInvoice } from '../../../features/invoices/invoicesSlice';
import { selectAllProducts } from '../../../features/products/productsSlice';
import '../../../styles/Table.css';

/**
 * @param {Object} props
 * @param {Array<import('../../../models/dataModels').Invoice>} props.invoices
 */
export default function InvoiceTable({ invoices }) {
    const dispatch = useDispatch();
    const allProducts = useSelector(selectAllProducts);

    const handleEdit = (invoiceId, field, value) => {
        dispatch(updateInvoice({
            id: invoiceId,
            changes: { [field]: value }
        }));
    };

    // Get first product for an invoice
    const getFirstProduct = (invoice) => {
        if (!invoice.productIds || invoice.productIds.length === 0) {
            return null;
        }
        return allProducts.find(p => p.id === invoice.productIds[0]);
    };

    if (invoices.length === 0) {
        return (
            <div className="empty-state">
                <p>No invoices yet. Upload a file to get started!</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Serial Number</th>
                        <th>Customer Name</th>
                        <th>Product Name</th>
                        <th>Qty</th>
                        <th>Tax</th>
                        <th>Total Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => {
                        const firstProduct = getFirstProduct(invoice);
                        const hasMultipleProducts = invoice.productIds.length > 1;

                        return (
                            <tr key={invoice.id}>
                                <td className={invoice.missingFields.includes('serialNumber') ? 'missing' : ''}>
                                    <input
                                        type="text"
                                        value={invoice.serialNumber || ''}
                                        onChange={(e) => handleEdit(invoice.id, 'serialNumber', e.target.value)}
                                        placeholder="Enter serial number"
                                        className="inline-input"
                                    />
                                </td>
                                <td className={invoice.missingFields.includes('customerName') ? 'missing' : ''}>
                                    <input
                                        type="text"
                                        value={invoice.customerName || ''}
                                        onChange={(e) => handleEdit(invoice.id, 'customerName', e.target.value)}
                                        placeholder="Enter customer name"
                                        className="inline-input"
                                    />
                                </td>
                                <td className={!firstProduct || !firstProduct.name ? 'product-info' : 'product-info'}>
                                    <span className="product-name">
                                        {firstProduct ? firstProduct.name || '—' : '—'}
                                        {hasMultipleProducts && (
                                            <span className="more-badge" title={`${invoice.productIds.length} total products`}>
                                                +{invoice.productIds.length - 1} more
                                            </span>
                                        )}
                                    </span>
                                </td>
                                <td className="product-info">
                                    <span>{firstProduct ? firstProduct.quantity || '—' : '—'}</span>
                                </td>
                                <td className={invoice.missingFields.includes('tax') ? 'missing' : ''}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={invoice.tax || ''}
                                        onChange={(e) => handleEdit(invoice.id, 'tax', parseFloat(e.target.value) || null)}
                                        placeholder="0.00"
                                        className="inline-input"
                                    />
                                </td>
                                <td className={invoice.missingFields.includes('totalAmount') ? 'missing' : ''}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={invoice.totalAmount || ''}
                                        onChange={(e) => handleEdit(invoice.id, 'totalAmount', parseFloat(e.target.value) || null)}
                                        placeholder="0.00"
                                        className="inline-input"
                                    />
                                </td>
                                <td className={invoice.missingFields.includes('date') ? 'missing' : ''}>
                                    <input
                                        type="date"
                                        value={invoice.date || ''}
                                        onChange={(e) => handleEdit(invoice.id, 'date', e.target.value)}
                                        className="inline-input"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
