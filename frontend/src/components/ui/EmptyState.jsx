import { Link } from 'react-router-dom';

/** Renders an empty result with one clear next action. */
export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}) {
  return (
    <section className="data-state" aria-live="polite">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {actionLabel && actionTo && <Link to={actionTo}>{actionLabel}</Link>}
    </section>
  );
}
