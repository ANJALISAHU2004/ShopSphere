import { Check, Clock3, PackageCheck, PackageOpen, X } from 'lucide-react';

const STATUS_ICONS = {
  PENDING: Clock3,
  CONFIRMED: Check,
  SHIPPED: PackageOpen,
  DELIVERED: PackageCheck,
  CANCELLED: X,
};

/** Renders an order status with text and a matching icon. */
export default function OrderStatusBadge({ status }) {
  const StatusIcon = STATUS_ICONS[status] ?? Clock3;

  return (
    <span className="order-status" data-status={status}>
      <StatusIcon aria-hidden="true" size={16} />
      <span>{status.toLowerCase().replaceAll('_', ' ')}</span>
    </span>
  );
}
