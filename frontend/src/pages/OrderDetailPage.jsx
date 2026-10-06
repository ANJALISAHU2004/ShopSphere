import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import OrderItemsTable from '../components/order/OrderItemsTable.jsx';
import OrderStatusBadge from '../components/order/OrderStatusBadge.jsx';
import OrderTimeline from '../components/order/OrderTimeline.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../components/ui/index.js';
import {
  useCancelOrder,
  useOrder,
  useOrderPayment,
} from '../hooks/useOrders.js';
import { formatDate, formatPrice } from '../utils/format.js';

/** Shows an order snapshot, payment, progress, and eligible cancellation. */
export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const orderQuery = useOrder(id);
  const paymentQuery = useOrderPayment(id, orderQuery.isSuccess);
  const cancelMutation = useCancelOrder();
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync(id);
      setConfirmCancel(false);
      await Promise.all([orderQuery.refetch(), paymentQuery.refetch()]);
    } catch {
      await orderQuery.refetch();
    }
  }

  if (orderQuery.isPending) {
    return <Skeleton className="order-detail-skeleton" label="Loading order" />;
  }

  if (orderQuery.isError && orderQuery.error.status === 404) {
    return (
      <EmptyState
        title="Order not found"
        description="This order may no longer be available."
        actionLabel="View your orders"
        actionTo="/orders"
      />
    );
  }

  if (orderQuery.isError) {
    return (
      <ErrorState
        message={orderQuery.error.message}
        onRetry={() => orderQuery.refetch()}
      />
    );
  }

  const order = orderQuery.data;
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const deliveryAddress = order.deliveryAddress;
  const payment = paymentQuery.data;
  const showJustPlaced = Boolean(location.state?.justPlaced);

  return (
    <article className="order-detail" aria-labelledby="order-detail-heading">
      <Link className="detail-back-link" to="/orders">
        Back to your orders
      </Link>
      {showJustPlaced && (
        <div className="order-placed-banner" role="status">
          Order placed. Your order number is #{order.orderId}.
        </div>
      )}
      <header className="order-detail__header">
        <div>
          <h1 id="order-detail-heading">Order #{order.orderId}</h1>
          <p>Placed {formatDate(order.placedAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="order-detail__summary">
        <span>Total</span>
        <strong>{formatPrice(order.totalAmount)}</strong>
      </div>

      <section
        className="order-detail__section"
        aria-labelledby="order-items-heading"
      >
        <h2 id="order-items-heading">Items</h2>
        <OrderItemsTable
          items={order.items ?? []}
          linkProducts={order.status === 'DELIVERED'}
        />
      </section>

      <div className="order-detail__columns">
        <section
          className="order-detail__section"
          aria-labelledby="delivery-heading"
        >
          <h2 id="delivery-heading">Delivery address</h2>
          <address>
            {deliveryAddress.line1}
            <br />
            {deliveryAddress.line2 && (
              <>
                {deliveryAddress.line2}
                <br />
              </>
            )}
            {deliveryAddress.city}, {deliveryAddress.state}{' '}
            {deliveryAddress.pincode}
          </address>
        </section>

        <section
          className="order-detail__section"
          aria-labelledby="payment-heading"
        >
          <h2 id="payment-heading">Payment</h2>
          {paymentQuery.isPending ? (
            <Skeleton className="payment-skeleton" label="Loading payment" />
          ) : paymentQuery.isError ? (
            <ErrorState
              message={paymentQuery.error.message}
              onRetry={() => paymentQuery.refetch()}
            />
          ) : (
            <dl className="order-payment-details">
              <div>
                <dt>Method</dt>
                <dd>{payment.paymentMethod}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{payment.status}</dd>
              </div>
              <div>
                <dt>Transaction reference</dt>
                <dd>{payment.transactionRef ?? 'Not available'}</dd>
              </div>
            </dl>
          )}
        </section>
      </div>

      <section
        className="order-detail__section"
        aria-labelledby="timeline-heading"
      >
        <h2 id="timeline-heading">Order progress</h2>
        <OrderTimeline status={order.status} />
      </section>

      {canCancel && (
        <Button variant="danger" onClick={() => setConfirmCancel(true)}>
          Cancel order
        </Button>
      )}

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        confirmLabel="Cancel order"
        pending={cancelMutation.isPending}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
      >
        <p>This order can no longer be cancelled after it ships.</p>
      </ConfirmDialog>
    </article>
  );
}
