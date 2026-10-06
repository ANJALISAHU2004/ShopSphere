import { Star } from 'lucide-react';

/** Displays a numeric average and a five-star visual summary. */
export default function RatingSummary({ averageRating, reviewCount }) {
  const roundedRating = Math.round(averageRating);

  return (
    <div
      className="rating-summary"
      aria-label={`${averageRating} out of 5 from ${reviewCount} reviews`}
    >
      <span className="rating-summary__stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            fill={index < roundedRating ? 'currentColor' : 'none'}
            size={18}
          />
        ))}
      </span>
      <span>
        {averageRating} from {reviewCount} reviews
      </span>
    </div>
  );
}
