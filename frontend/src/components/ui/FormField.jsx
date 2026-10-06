import { cloneElement } from 'react';

/** Renders a visible label, control, hint, and associated validation error. */
export default function FormField({ label, htmlFor, hint, error, children }) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {cloneElement(children, {
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(errorMessage),
      })}
      {hint && (
        <span className="form-field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {errorMessage && (
        <span className="form-field__error" id={errorId}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
