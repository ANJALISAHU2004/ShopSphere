import httpClient from './httpClient.js';

/** Fetches review summary and reviews for one product. */
export async function getProductReviews(productId) {
  const response = await httpClient.get(`/api/reviews/product/${productId}`);
  return response.data;
}

/** Creates a review for a purchased product. */
export async function createReview(review) {
  const response = await httpClient.post('/api/reviews', review);
  return response.data;
}

/** Updates the authenticated user's review. */
export async function updateReview(reviewId, review) {
  const response = await httpClient.put(`/api/reviews/${reviewId}`, review);
  return response.data;
}

/** Deletes the authenticated user's review. */
export async function deleteReview(reviewId) {
  return httpClient.delete(`/api/reviews/${reviewId}`);
}

/** Lists reviews written by the authenticated user. */
export async function getMyReviews() {
  const response = await httpClient.get('/api/reviews/me');
  return response.data;
}
