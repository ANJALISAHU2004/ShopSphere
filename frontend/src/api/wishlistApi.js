import httpClient from './httpClient.js';

/** Loads the authenticated customer's live wishlist. */
export async function getWishlist() {
	const response = await httpClient.get('/api/wishlist');
	return response.data;
}

/** Adds a product to the wishlist. */
export async function addWishlistItem(productId) {
	// ASSUMPTION: see frontend-requirements §12; success may return the updated wishlist.
	const response = await httpClient.post('/api/wishlist/items', { productId });
	return response.data;
}

/** Removes a wishlist line. */
export async function removeWishlistItem(itemId) {
	// ASSUMPTION: see frontend-requirements §12; success may return the updated wishlist.
	const response = await httpClient.delete(`/api/wishlist/items/${itemId}`);
	return response.data;
}

/** Atomically moves a wishlist line into the cart. */
export async function moveWishlistItemToCart(itemId) {
	// ASSUMPTION: see frontend-requirements §12; success may return the updated wishlist.
	const response = await httpClient.post(`/api/wishlist/items/${itemId}/move-to-cart`);
	return response.data;
}