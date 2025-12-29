/**
 * @fileoverview Product table component with inline editing
 */

import { useDispatch } from 'react-redux';
import { updateProduct } from '../../../features/products/productsSlice';
import '../../../styles/Table.css';

/**
 * @param {Object} props
 * @param {Array<import('../../../models/dataModels').Product>} props.products
 */
export default function ProductTable({ products }) {
    const dispatch = useDispatch();

    const handleEdit = (productId, field, value) => {
        dispatch(updateProduct({
            id: productId,
            changes: { [field]: value }
        }));
    };

    if (products.length === 0) {
        return (
            <div className="empty-state">
                <p>No products yet. Upload a file to get started!</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Tax</th>
                        <th>Price with Tax</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td className={product.missingFields.includes('name') ? 'missing' : ''}>
                                <input
                                    type="text"
                                    value={product.name || ''}
                                    onChange={(e) => handleEdit(product.id, 'name', e.target.value)}
                                    placeholder="Enter product name"
                                    className="inline-input"
                                />
                            </td>
                            <td className={product.missingFields.includes('quantity') ? 'missing' : ''}>
                                <input
                                    type="number"
                                    value={product.quantity || ''}
                                    onChange={(e) => handleEdit(product.id, 'quantity', parseInt(e.target.value) || null)}
                                    placeholder="0"
                                    className="inline-input"
                                />
                            </td>
                            <td className={product.missingFields.includes('unitPrice') ? 'missing' : ''}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={product.unitPrice || ''}
                                    onChange={(e) => handleEdit(product.id, 'unitPrice', parseFloat(e.target.value) || null)}
                                    placeholder="0.00"
                                    className="inline-input"
                                />
                            </td>
                            <td className={product.missingFields.includes('tax') ? 'missing' : ''}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={product.tax || ''}
                                    onChange={(e) => handleEdit(product.id, 'tax', parseFloat(e.target.value) || null)}
                                    placeholder="0.00"
                                    className="inline-input"
                                />
                            </td>
                            <td className={product.missingFields.includes('priceWithTax') ? 'missing' : ''}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={product.priceWithTax || ''}
                                    onChange={(e) => handleEdit(product.id, 'priceWithTax', parseFloat(e.target.value) || null)}
                                    placeholder="0.00"
                                    className="inline-input"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
