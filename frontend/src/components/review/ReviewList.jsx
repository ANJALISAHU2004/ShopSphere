import { Star } from 'lucide-react';
import { Button } from '../ui/index.js';
import { formatDate } from '../../utils/format.js';

/** Renders customer reviews returned with a product's review summary. */
export default function ReviewList({
  reviews,
  currentUserId,
  onEdit,
  onDelete,
}) {
  if (reviews.length === 0) {
    return <p>No reviews yet.</p>;
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li className="review-item" key={review.reviewId}>
          <div className="review-item__heading">
            <h3>
              {review.userName}
              {String(review.userId) === String(currentUserId) && (
                <span className="review-item__you"> (you)</span>
              )}
            </h3>
            <time dateTime={review.createdAt}>
              {formatDate(review.createdAt)}
            </time>
          </div>
          <p
            className="review-item__rating"
            aria-label={`${review.rating} out of 5 stars`}
          >
            {Array.from({ length: review.rating }, (_, index) => (
              <Star
                aria-hidden="true"
                fill="currentColor"
                key={index}
                size={16}
              />
            ))}
          </p>
          {review.comment && <p>{review.comment}</p>}
          {String(review.userId) === String(currentUserId) &&
            onEdit &&
            onDelete && (
              <div className="review-item__actions">
                <Button variant="secondary" onClick={() => onEdit(review)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(review)}>
                  Delete
                </Button>
              </div>
            )}
        </li>
      ))}
    </ul>
  );
}
