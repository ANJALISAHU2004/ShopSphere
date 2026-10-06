import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  deleteReview,
  getMyReviews,
  getProductReviews,
  updateReview,
} from '../api/reviewApi.js';

export const MY_REVIEWS_QUERY_KEY = ['my-reviews'];

/** Loads a product's rating summary and review list separately from detail. */
export function useReviews(productId) {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () => getProductReviews(productId),
    enabled: Boolean(productId),
  });
}

/** Loads reviews written by the authenticated user. */
export function useMyReviews() {
  return useQuery({
    queryKey: MY_REVIEWS_QUERY_KEY,
    queryFn: getMyReviews,
  });
}

/** Invalidates product and personal review lists after a review mutation. */
function useReviewMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['product-reviews'] }),
        queryClient.invalidateQueries({ queryKey: MY_REVIEWS_QUERY_KEY }),
      ]);
    },
  });
}

/** Creates a review and refreshes review lists. */
export function useCreateReview() {
  return useReviewMutation(createReview);
}

/** Updates a review and refreshes review lists. */
export function useUpdateReview() {
  return useReviewMutation(({ reviewId, review }) =>
    updateReview(reviewId, review),
  );
}

/** Deletes a review and refreshes review lists. */
export function useDeleteReview() {
  return useReviewMutation(deleteReview);
}
