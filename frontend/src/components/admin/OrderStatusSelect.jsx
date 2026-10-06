const NEXT_STATUSES = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

/** Offers only valid next order statuses and requires parent confirmation for cancellation. */
export default function OrderStatusSelect({ order, disabled, onChange }) {
  const nextStatuses = NEXT_STATUSES[order.status] ?? [];

  if (nextStatuses.length === 0) {
    return <span className="admin-order__terminal">No further updates</span>;
  }

  return (
    <select
      aria-label={`Update order ${order.orderId} status`}
      className="ui-input admin-order__status-select"
      disabled={disabled}
      onChange={(event) => {
        const status = event.target.value;
        if (status) onChange(status);
        event.target.value = '';
      }}
      value=""
    >
      <option value="" disabled>
        Change status
      </option>
      {nextStatuses.map((status) => (
        <option key={status} value={status}>
          {status.toLowerCase().replaceAll('_', ' ')}
        </option>
      ))}
    </select>
  );
}
