/** Renders a shared, accessible form input. */
export default function Input({ className = '', ...props }) {
  return <input className={`ui-input ${className}`.trim()} {...props} />;
}
