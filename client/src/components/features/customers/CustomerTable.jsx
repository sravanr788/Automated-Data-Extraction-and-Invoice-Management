/**
 * @fileoverview Customer table component with inline editing
 */

import { useDispatch } from 'react-redux';
import { updateCustomer } from '../../../features/customers/customersSlice';
import '../../../styles/Table.css';

/**
 * @param {Object} props
 * @param {Array<import('../../../models/dataModels').Customer>} props.customers
 */
export default function CustomerTable({ customers }) {
    const dispatch = useDispatch();

    const handleEdit = (customerId, field, value) => {
        dispatch(updateCustomer({
            id: customerId,
            changes: { [field]: value }
        }));
    };

    if (customers.length === 0) {
        return (
            <div className="empty-state">
                <p>No customers yet. Upload a file to get started!</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Phone</th>
                        <th>Total Purchase Amount</th>
                        <th>Invoices</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer.id}>
                            <td className={customer.missingFields.includes('name') ? 'missing' : ''}>
                                <input
                                    type="text"
                                    value={customer.name || ''}
                                    onChange={(e) => handleEdit(customer.id, 'name', e.target.value)}
                                    placeholder="Enter customer name"
                                    className="inline-input"
                                />
                            </td>
                            <td className={customer.missingFields.includes('phone') ? 'missing' : ''}>
                                <input
                                    type="tel"
                                    value={customer.phone || ''}
                                    onChange={(e) => handleEdit(customer.id, 'phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className="inline-input"
                                />
                            </td>
                            <td className={customer.missingFields.includes('totalPurchaseAmount') ? 'missing' : ''}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={customer.totalPurchaseAmount || ''}
                                    onChange={(e) => handleEdit(customer.id, 'totalPurchaseAmount', parseFloat(e.target.value) || null)}
                                    placeholder="0.00"
                                    className="inline-input"
                                />
                            </td>
                            <td className="count-badge">
                                {customer.invoiceIds.length} invoices
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
