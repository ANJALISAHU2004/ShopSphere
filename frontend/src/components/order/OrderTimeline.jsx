const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

/** Shows order progress without inventing timestamps for status changes. */
export default function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <p className="order-timeline__cancelled" role="status">
        This order was cancelled.
      </p>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(status);

  return (
    <ol className="order-timeline" aria-label="Order status timeline">
      {ORDER_STEPS.map((step, index) => (
        <li
          className="order-timeline__step"
          data-complete={index <= currentIndex}
          aria-current={index === currentIndex ? 'step' : undefined}
          key={step}
        >
          <span className="order-timeline__marker" aria-hidden="true" />
          <span>{step.toLowerCase()}</span>
        </li>
      ))}
    </ol>
  );
}
