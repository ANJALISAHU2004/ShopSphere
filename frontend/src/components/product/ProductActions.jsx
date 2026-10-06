import { Heart, ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/index.js';
import useAuth from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { useWishlist } from '../../hooks/useWishlist.js';

/** Renders cart and wishlist actions using the shared customer caches. */
export default function ProductActions({
  product,
  quantity = 1,
  cartDisabled = false,
}) {
  const { session, isAdmin } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const wishlistItem = wishlist.data?.items?.find(
    (item) => String(item.productId) === String(product.id),
  );

  if (isAdmin) return null;

  function requireCustomer() {
    if (session) return true;
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    return false;
  }

  function handleAddToCart() {
    if (!requireCustomer()) return;
    void cart.addItem({ productId: product.id, quantity }).catch(() => {});
  }

  function handleWishlist() {
    if (!requireCustomer()) return;
    const mutation = wishlistItem
      ? wishlist.removeItem(wishlistItem.itemId)
      : wishlist.addItem(product.id);
    void mutation.catch(() => {});
  }

  return (
    <div className="product-actions">
      <Button
        disabled={cartDisabled || cart.isAdding}
        loading={cart.isAdding}
        loadingLabel="Adding"
        onClick={handleAddToCart}
      >
        <ShoppingCart aria-hidden="true" size={18} />
        Add to cart
      </Button>
      <Button
        className="product-actions__wishlist"
        variant="ghost"
        aria-label={
          wishlistItem
            ? `Remove ${product.name} from wishlist`
            : `Add ${product.name} to wishlist`
        }
        aria-pressed={Boolean(wishlistItem)}
        disabled={wishlist.isAdding || wishlist.isRemoving}
        loading={wishlist.isAdding || wishlist.isRemoving}
        loadingLabel="Saving"
        onClick={handleWishlist}
      >
        <Heart
          aria-hidden="true"
          fill={wishlistItem ? 'currentColor' : 'none'}
          size={18}
        />
        <span>{wishlistItem ? 'Saved' : 'Save'}</span>
      </Button>
    </div>
  );
}
