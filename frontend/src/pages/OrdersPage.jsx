import { useState } from 'react';
import { Link } from 'react-router-dom';
import OrderStatusBadge from '../components/order/OrderStatusBadge.jsx';
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../components/ui/index.js';
import { useOrders } from '../hooks/useOrders.js';
import { formatDate, formatPrice } from '../utils/format.js';

const PAGE_SIZE = 12;

/** Lists the customer's paginated order history. */
export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const ordersQuery = useOrders({ page, size: PAGE_SIZE });
  const orders = ordersQuery.data?.content ?? [];
  const totalPages = ordersQuery.data?.totalPages ?? 0;

  return (
    <section className="orders-page" aria-labelledby="orders-heading">
      <h1 id="orders-heading">Your orders</h1>
      {ordersQuery.isPending ? (
        <div className="orders-skeleton-list" aria-label="Loading orders">
          <Skeleton className="orders-skeleton-row" />
          <Skeleton className="orders-skeleton-row" />
          <Skeleton className="orders-skeleton-row" />
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState
          message={ordersQuery.error.message}
          onRetry={() => ordersQuery.refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your completed checkouts will appear here."
          actionLabel="Browse products"
          actionTo="/products"
        />
      ) : (
        <>
          <div className="orders-table-wrap">
            <table className="orders-table">
              <caption className="sr-only">Your orders</caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Date</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <th scope="row" data-label="Order">
                      #{order.orderId}
                    </th>
                    <td data-label="Date">{formatDate(order.placedAt)}</td>
                    <td data-label="Items">{order.itemCount}</td>
                    <td data-label="Total">{formatPrice(order.totalAmount)}</td>
                    <td data-label="Status">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td data-label="Details">
                      <Link to={`/orders/${order.orderId}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav className="orders-pagination" aria-label="Order pages">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
