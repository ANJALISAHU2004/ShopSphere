import { Button } from './index.js';

/** Renders a readable data error with a retry action. */
export default function ErrorState({ message, onRetry }) {
  return (
    <section className="data-state" role="alert">
      <h2>We could not load this information</h2>
      <p>{message}</p>
      <Button onClick={onRetry}>Try again</Button>
    </section>
  );
}
