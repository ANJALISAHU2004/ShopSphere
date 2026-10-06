import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/index.js';
import { formatPrice } from '../../utils/format.js';

/** Renders cart totals from the server without recalculating money. */
export default function CartSummary({ itemCount, subtotal, checkoutDisabled }) {
  const navigate = useNavigate();

  return (
    <aside className="cart-summary" aria-labelledby="cart-summary-heading">
      <h2 id="cart-summary-heading">Order summary</h2>
      <dl>
        <div>
          <dt>Items</dt>
          <dd>{itemCount}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      {checkoutDisabled && (
        <p className="cart-summary__notice">
          Remove unavailable items before continuing to checkout.
        </p>
      )}
      <Button disabled={checkoutDisabled} onClick={() => navigate('/checkout')}>
        Checkout
      </Button>
    </aside>
  );
}
