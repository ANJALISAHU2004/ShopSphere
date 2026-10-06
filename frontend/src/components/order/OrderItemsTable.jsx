import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format.js';

/** Renders the immutable product and price snapshot stored on an order. */
export default function OrderItemsTable({ items, linkProducts = false }) {
  return (
    <div className="order-items-table-wrap">
      <table className="order-items-table">
        <caption className="sr-only">Items in this order</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Unit price</th>
            <th scope="col">Quantity</th>
            <th scope="col">Line total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.productId}-${index}`}>
              <th scope="row" data-label="Product">
                {linkProducts && item.productId ? (
                  <Link to={`/products/${item.productId}`}>
                    {item.productName}
                  </Link>
                ) : (
                  item.productName
                )}
              </th>
              <td data-label="Unit price">{formatPrice(item.unitPrice)}</td>
              <td data-label="Quantity">{item.quantity}</td>
              <td data-label="Line total">{formatPrice(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
