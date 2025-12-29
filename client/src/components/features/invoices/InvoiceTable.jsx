/**
 * @fileoverview Invoice table component with inline editing
 */

import { useDispatch } from 'react-redux';
import { updateInvoice } from '../../../features/invoices/invoicesSlice';
import '../../../styles/Table.css';

/**
 * @param {Object} props
 * @param {Array<import('../../../models/dataModels').Invoice>} props.invoices
 */
export default function InvoiceTable({ invoices }) {
    const dispatch = useDispatch();

    const handleEdit = (invoiceId, field, value) => {
        dispatch(updateInvoice({
            id: invoiceId,
            changes: { [field]: value }
        }));
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
                        <th>Date</th>
                        <th>Customer Name</th>
                        <th>Total Amount</th>
                        <th>Tax</th>
                        <th>Products</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
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
                            <td className={invoice.missingFields.includes('date') ? 'missing' : ''}>
                                <input
                                    type="date"
                                    value={invoice.date || ''}
                                    onChange={(e) => handleEdit(invoice.id, 'date', e.target.value)}
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
                            <td className="count-badge">
                                {invoice.productIds.length} items
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
