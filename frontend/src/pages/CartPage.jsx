import { useState } from 'react';
import CartLine from '../components/cart/CartLine.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../components/ui/index.js';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useCart } from '../hooks/useCart.js';

/** Shows the customer's server-backed cart and checkout summary. */
export default function CartPage() {
  const cart = useCart();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const items = cart.data?.items ?? [];

  function handleQuantityChange(itemId, quantity) {
    void cart.updateItem({ itemId, quantity }).catch(() => {});
  }

  function handleRemove(itemId) {
    void cart.removeItem(itemId).catch(() => {});
  }

  function handleEmptyCart() {
    void cart
      .clear()
      .then(() => setConfirmEmpty(false))
      .catch(() => {});
  }

  if (cart.isPending) {
    return (
      <section className="cart-page" aria-labelledby="cart-heading">
        <h1 id="cart-heading">Your cart</h1>
        <div className="cart-layout">
          <div className="cart-lines" aria-label="Loading cart">
            <Skeleton className="cart-line-skeleton" />
            <Skeleton className="cart-line-skeleton" />
          </div>
          <Skeleton className="cart-summary-skeleton" />
        </div>
      </section>
    );
  }

  if (cart.isError) {
    return (
      <section className="cart-page" aria-labelledby="cart-heading">
        <h1 id="cart-heading">Your cart</h1>
        <ErrorState
          message={cart.error.message}
          onRetry={() => cart.refetch()}
        />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="cart-page" aria-labelledby="cart-heading">
        <h1 id="cart-heading">Your cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Find something you like in the product catalogue."
          actionLabel="Browse products"
          actionTo="/products"
        />
      </section>
    );
  }

  const hasUnavailableItems = items.some((item) => !item.available);

  return (
    <section className="cart-page" aria-labelledby="cart-heading">
      <div className="cart-page__heading">
        <div>
          <h1 id="cart-heading">Your cart</h1>
          <p>{cart.data.itemCount} items</p>
        </div>
        <Button variant="danger" onClick={() => setConfirmEmpty(true)}>
          Empty cart
        </Button>
      </div>
      <div className="cart-layout">
        <div className="cart-lines" aria-label="Cart items">
          {items.map((item) => (
            <CartLine
              key={item.itemId}
              item={item}
              busy={cart.isUpdating || cart.isRemoving}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}
        </div>
        <CartSummary
          itemCount={cart.data.itemCount}
          subtotal={cart.data.subtotal}
          checkoutDisabled={hasUnavailableItems}
        />
      </div>
      <ConfirmDialog
        open={confirmEmpty}
        title="Empty your cart?"
        confirmLabel="Empty cart"
        pending={cart.isClearing}
        onCancel={() => setConfirmEmpty(false)}
        onConfirm={handleEmptyCart}
      >
        <p>This removes every item from your cart.</p>
      </ConfirmDialog>
    </section>
  );
}
