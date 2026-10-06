import { ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/product/ProductImage.jsx';
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../components/ui/index.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { formatPrice } from '../utils/format.js';

/** Shows saved products and supports atomic move-to-cart actions. */
export default function WishlistPage() {
  const wishlist = useWishlist();
  const items = wishlist.data?.items ?? [];

  function handleRemove(itemId) {
    void wishlist.removeItem(itemId).catch(() => {});
  }

  function handleMove(itemId) {
    void wishlist.moveToCart(itemId).catch(() => {});
  }

  if (wishlist.isPending) {
    return (
      <section className="wishlist-page" aria-labelledby="wishlist-heading">
        <h1 id="wishlist-heading">Your wishlist</h1>
        <div className="wishlist-grid" aria-label="Loading wishlist">
          <Skeleton className="wishlist-skeleton" />
          <Skeleton className="wishlist-skeleton" />
          <Skeleton className="wishlist-skeleton" />
        </div>
      </section>
    );
  }

  if (wishlist.isError) {
    return (
      <section className="wishlist-page" aria-labelledby="wishlist-heading">
        <h1 id="wishlist-heading">Your wishlist</h1>
        <ErrorState
          message={wishlist.error.message}
          onRetry={() => wishlist.refetch()}
        />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="wishlist-page" aria-labelledby="wishlist-heading">
        <h1 id="wishlist-heading">Your wishlist</h1>
        <EmptyState
          title="Your wishlist is empty"
          description="Save products to keep them together here."
          actionLabel="Browse products"
          actionTo="/products"
        />
      </section>
    );
  }

  return (
    <section className="wishlist-page" aria-labelledby="wishlist-heading">
      <div className="wishlist-page__heading">
        <div>
          <h1 id="wishlist-heading">Your wishlist</h1>
          <p>{wishlist.data.itemCount} items</p>
        </div>
      </div>
      <div className="wishlist-grid">
        {items.map((item) => (
          <article className="wishlist-item" key={item.itemId}>
            <Link
              className="wishlist-item__image"
              to={`/products/${item.productId}`}
            >
              <ProductImage
                src={item.imageUrl}
                alt={item.productName}
                name={item.productName}
              />
            </Link>
            <div className="wishlist-item__body">
              <h2>
                <Link to={`/products/${item.productId}`}>
                  {item.productName}
                </Link>
              </h2>
              <p className="wishlist-item__price">{formatPrice(item.price)}</p>
              <p className="wishlist-item__stock" data-in-stock={item.inStock}>
                {item.inStock ? 'In stock' : 'Out of stock'}
              </p>
              <div className="wishlist-item__actions">
                <Button
                  disabled={!item.inStock || wishlist.isMoving}
                  loading={wishlist.movingItemId === item.itemId}
                  loadingLabel="Moving"
                  onClick={() => handleMove(item.itemId)}
                >
                  <ArrowRight aria-hidden="true" size={18} />
                  Move to cart
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Remove ${item.productName} from wishlist`}
                  disabled={wishlist.isRemoving || wishlist.isMoving}
                  onClick={() => handleRemove(item.itemId)}
                >
                  <Trash2 aria-hidden="true" size={18} />
                  Remove
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
