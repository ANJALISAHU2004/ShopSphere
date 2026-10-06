import { useState } from 'react';
import { toast } from 'sonner';
import {
  useAdminOrders,
  useUpdateAdminOrderStatus,
} from '../../hooks/useOrders.js';
import { formatDate, formatPrice } from '../../utils/format.js';
import OrderStatusBadge from '../order/OrderStatusBadge.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../ui/index.js';
import OrderStatusSelect from './OrderStatusSelect.jsx';

const PAGE_SIZE = 12;

/** Displays all paginated orders and offers only valid next status changes. */
export default function AdminOrdersTable() {
  const [page, setPage] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [statusError, setStatusError] = useState('');
  const ordersQuery = useAdminOrders({ page, size: PAGE_SIZE });
  const statusMutation = useUpdateAdminOrderStatus();
  const orders = ordersQuery.data?.content;

  async function updateStatus(order, status) {
    setStatusError('');
    try {
      await statusMutation.mutateAsync({
        orderId: order.orderId,
        status,
      });
      toast.success(`Order #${order.orderId} updated`);
      return true;
    } catch (error) {
      setStatusError(
        error?.message ?? 'Unable to update this order. Try again.',
      );
      return false;
    }
  }

  async function confirmCancellation() {
    if (!cancellingOrder) return;
    if (await updateStatus(cancellingOrder, 'CANCELLED')) {
      setCancellingOrder(null);
    }
  }

  return (
    <section className="admin-manager" aria-labelledby="admin-orders-heading">
      <div className="admin-manager__heading">
        <div>
          <h2 id="admin-orders-heading">All orders</h2>
          <p>Review orders and move them through valid statuses.</p>
        </div>
      </div>
      {statusError && <Alert>{statusError}</Alert>}
      {ordersQuery.isPending ? (
        <div className="admin-table-skeleton">
          <Skeleton className="admin-table-skeleton__row" />
          <Skeleton className="admin-table-skeleton__row" />
          <Skeleton className="admin-table-skeleton__row" />
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState
          message={ordersQuery.error.message}
          onRetry={() => ordersQuery.refetch()}
        />
      ) : !Array.isArray(orders) ? (
        <Alert>
          Orders could not be displayed because the server returned an
          unexpected response.
        </Alert>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders will appear here when customers complete checkout."
          actionLabel="View products"
          actionTo="/products"
        />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Placed</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td data-label="Order">#{order.orderId}</td>
                    <td data-label="Placed">{formatDate(order.placedAt)}</td>
                    <td data-label="Items">{order.itemCount}</td>
                    <td data-label="Total">{formatPrice(order.totalAmount)}</td>
                    <td data-label="Status">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td data-label="Update">
                      <OrderStatusSelect
                        order={order}
                        disabled={
                          statusMutation.isPending &&
                          statusMutation.variables?.orderId === order.orderId
                        }
                        onChange={(status) => {
                          if (status === 'CANCELLED') {
                            setCancellingOrder(order);
                          } else {
                            updateStatus(order, status);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(ordersQuery.data.totalPages ?? 0) > 1 && (
            <nav className="admin-pagination" aria-label="Order pages">
              <Button
                variant="secondary"
                disabled={page <= 0}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span>
                Page {page + 1} of {ordersQuery.data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page + 1 >= ordersQuery.data.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
      <ConfirmDialog
        open={Boolean(cancellingOrder)}
        title="Cancel this order?"
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        pending={
          statusMutation.isPending &&
          statusMutation.variables?.orderId === cancellingOrder?.orderId
        }
        onCancel={() => setCancellingOrder(null)}
        onConfirm={confirmCancellation}
      >
        <p>Order #{cancellingOrder?.orderId} will be marked as cancelled.</p>
      </ConfirmDialog>
    </section>
  );
}
