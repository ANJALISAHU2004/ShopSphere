import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductImage from '../components/product/ProductImage.jsx';
import ProductActions from '../components/product/ProductActions.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../components/ui/index.js';
import ReviewForm from '../components/review/ReviewForm.jsx';
import RatingSummary from '../components/review/RatingSummary.jsx';
import ReviewList from '../components/review/ReviewList.jsx';
import useAuth from '../hooks/useAuth.js';
import { useProduct } from '../hooks/useProducts.js';
import {
  useCreateReview,
  useDeleteReview,
  useReviews,
  useUpdateReview,
} from '../hooks/useReviews.js';
import { formatPrice } from '../utils/format.js';

/** Renders product detail and its separately fetched reviews. */
export default function ProductDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const productQuery = useProduct(id);
  const reviewsQuery = useReviews(id);
  const [quantity, setQuantity] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [reviewError, setReviewError] = useState('');
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    const stockQuantity = productQuery.data?.stockQuantity;
    if (stockQuantity !== undefined) {
      setQuantity((current) => Math.min(current, Math.max(1, stockQuantity)));
    }
  }, [productQuery.data?.stockQuantity]);

  if (productQuery.isPending) {
    return (
      <div className="detail-skeleton" aria-label="Loading product">
        <Skeleton className="detail-skeleton__image" />
        <div className="detail-skeleton__copy">
          <Skeleton className="detail-skeleton__line" />
          <Skeleton className="detail-skeleton__line" />
          <Skeleton className="detail-skeleton__line" />
        </div>
      </div>
    );
  }

  if (productQuery.isError && productQuery.error.status === 404) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been removed or the link may be incorrect."
        actionLabel="Browse products"
        actionTo="/products"
      />
    );
  }

  if (productQuery.isError) {
    return (
      <ErrorState
        message={productQuery.error.message}
        onRetry={() => productQuery.refetch()}
      />
    );
  }

  const product = productQuery.data;
  const inStock = product.stockQuantity > 0;
  const stockMessage = inStock
    ? product.stockQuantity <= 5
      ? `Only ${product.stockQuantity} left`
      : 'In stock'
    : 'Out of stock';
  const reviews = Array.isArray(reviewsQuery.data?.reviews)
    ? reviewsQuery.data.reviews
    : null;
  const currentUserId =
    session?.role === 'CUSTOMER' ? session.userId : undefined;
  const ownReview = currentUserId
    ? reviews.find((review) => String(review.userId) === String(currentUserId))
    : undefined;

  async function saveReview(values) {
    setReviewError('');
    if (editingReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: editingReview.reviewId,
        review: values,
      });
    } else {
      await createReviewMutation.mutateAsync({
        productId: product.id,
        ...values,
      });
    }
    setEditingReview(null);
  }

  async function deleteOwnReview() {
    setReviewError('');
    try {
      await deleteReviewMutation.mutateAsync(deletingReview.reviewId);
      setDeletingReview(null);
    } catch (error) {
      setReviewError(
        error?.message ?? 'Unable to delete your review. Try again.',
      );
    }
  }

  return (
    <article className="product-detail">
      <div className="product-detail__main">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          name={product.name}
        />
        <div className="product-detail__copy">
          <Link className="detail-back-link" to="/products">
            Back to products
          </Link>
          <p className="product-card__category">{product.categoryName}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">{formatPrice(product.price)}</p>
          <p className="product-detail__stock" data-in-stock={inStock}>
            {stockMessage}
          </p>
          <p className="product-detail__description">{product.description}</p>
          <div className="quantity-control" aria-label="Quantity">
            <span>Quantity</span>
            <div className="quantity-control__stepper">
              <Button
                variant="secondary"
                aria-label="Decrease quantity"
                disabled={!inStock || quantity <= 1}
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
              >
                <Minus aria-hidden="true" size={16} />
              </Button>
              <output aria-live="polite">{quantity}</output>
              <Button
                variant="secondary"
                aria-label="Increase quantity"
                disabled={!inStock || quantity >= product.stockQuantity}
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(product.stockQuantity, current + 1),
                  )
                }
              >
                <Plus aria-hidden="true" size={16} />
              </Button>
            </div>
          </div>
          <ProductActions
            product={product}
            quantity={quantity}
            cartDisabled={!inStock}
          />
        </div>
      </div>

      <section className="product-reviews" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading">Customer reviews</h2>
        {reviewsQuery.isPending ? (
          <div className="reviews-skeleton" aria-label="Loading reviews">
            <Skeleton className="reviews-skeleton__line" />
            <Skeleton className="reviews-skeleton__line" />
          </div>
        ) : reviewsQuery.isError ? (
          <ErrorState
            message={reviewsQuery.error.message}
            onRetry={() => reviewsQuery.refetch()}
          />
        ) : !reviews ? (
          <ErrorState
            message="Reviews could not be displayed because the server returned an unexpected response."
            onRetry={() => reviewsQuery.refetch()}
          />
        ) : (
          <>
            {reviewsQuery.data.reviewCount > 0 && (
              <RatingSummary
                averageRating={reviewsQuery.data.averageRating}
                reviewCount={reviewsQuery.data.reviewCount}
              />
            )}
            {reviewError && <Alert>{reviewError}</Alert>}
            <ReviewList
              reviews={reviews}
              currentUserId={currentUserId}
              onEdit={currentUserId ? setEditingReview : undefined}
              onDelete={currentUserId ? setDeletingReview : undefined}
            />
            {currentUserId && !ownReview && !editingReview && (
              <ReviewForm onSave={saveReview} />
            )}
            {currentUserId && editingReview && (
              <ReviewForm
                review={editingReview}
                onSave={saveReview}
                onCancel={() => setEditingReview(null)}
              />
            )}
            <ConfirmDialog
              open={Boolean(deletingReview)}
              title="Delete your review?"
              confirmLabel="Delete review"
              cancelLabel="Keep review"
              pending={deleteReviewMutation.isPending}
              onCancel={() => setDeletingReview(null)}
              onConfirm={deleteOwnReview}
            >
              <p>Your review will be removed from this product.</p>
            </ConfirmDialog>
          </>
        )}
      </section>
    </article>
  );
}
