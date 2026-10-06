/** Renders a layout-preserving loading placeholder. */
export default function Skeleton({ className = '', label = 'Loading' }) {
  return <span className={`skeleton ${className}`.trim()} aria-label={label} />;
}
