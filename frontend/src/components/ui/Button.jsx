/** Renders a shared button with disabled and loading states. */
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  loading = false,
  loadingLabel = 'Loading',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`ui-button ui-button--${variant} ${className}`.trim()}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="ui-button__spinner" aria-hidden="true" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
