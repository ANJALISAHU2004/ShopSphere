/** Renders an accessible inline message. */
export default function Alert({ children, variant = 'error' }) {
  return (
    <div
      className={`ui-alert ui-alert--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
