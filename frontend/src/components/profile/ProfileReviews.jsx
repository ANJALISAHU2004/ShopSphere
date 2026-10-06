import { useState } from 'react';
import { formatDate } from '../../utils/format.js';
import {
  useDeleteReview,
  useMyReviews,
  useUpdateReview,
} from '../../hooks/useReviews.js';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../ui/index.js';
import ReviewForm from '../review/ReviewForm.jsx';

/** Lists the signed-in user's reviews and supports editing or removing them. */
export default function ProfileReviews() {
  const reviewsQuery = useMyReviews();
  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  async function saveReview(values) {
    await updateMutation.mutateAsync({
      reviewId: editingReview.reviewId,
      review: values,
    });
    setEditingReview(null);
  }

  async function deleteReview() {
    setDeleteError('');
    try {
      await deleteMutation.mutateAsync(deletingReview.reviewId);
      setDeletingReview(null);
    } catch (error) {
      setDeleteError(
        error?.message ?? 'Unable to delete this review. Try again.',
      );
    }
  }

  if (reviewsQuery.isPending) {
    return (
      <div
        className="profile-reviews__loading"
        aria-label="Loading your reviews"
      >
        <Skeleton className="profile-review-skeleton" />
        <Skeleton className="profile-review-skeleton" />
      </div>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <ErrorState
        message={reviewsQuery.error.message}
        onRetry={() => reviewsQuery.refetch()}
      />
    );
  }

  if (!Array.isArray(reviewsQuery.data)) {
    return (
      <Alert>
        Your reviews could not be displayed because the server returned an
        unexpected response.
      </Alert>
    );
  }

  if (reviewsQuery.data.length === 0) {
    return (
      <EmptyState
        title="You have not reviewed any products yet"
        description="After a product is delivered, you can share your experience."
        actionLabel="Browse products"
        actionTo="/products"
      />
    );
  }

  return (
    <div className="profile-reviews">
      {deleteError && <Alert>{deleteError}</Alert>}
      <ul className="review-list">
        {reviewsQuery.data.map((review) => (
          <li className="review-item" key={review.reviewId}>
            <div className="review-item__heading">
              <h3>Your review</h3>
              <time dateTime={review.createdAt}>
                {formatDate(review.createdAt)}
              </time>
            </div>
            <p className="profile-review__rating">{review.rating} out of 5</p>
            {review.comment && <p>{review.comment}</p>}
            <div className="review-item__actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteError('');
                  setEditingReview(review);
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDeleteError('');
                  setDeletingReview(review);
                }}
              >
                Delete
              </Button>
            </div>
            {editingReview?.reviewId === review.reviewId && (
              <ReviewForm
                key={review.reviewId}
                review={review}
                onSave={saveReview}
                onCancel={() => setEditingReview(null)}
              />
            )}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={Boolean(deletingReview)}
        title="Delete this review?"
        confirmLabel="Delete review"
        cancelLabel="Keep review"
        pending={deleteMutation.isPending}
        onCancel={() => setDeletingReview(null)}
        onConfirm={deleteReview}
      >
        <p>This review will be removed from the product page.</p>
      </ConfirmDialog>
    </div>
  );
}
