import httpClient from './httpClient.js';

/** Loads the authenticated customer's cart and server-calculated totals. */
export async function getCart() {
	const response = await httpClient.get('/api/cart');
	return response.data;
}

/** Adds a product to the cart and returns the updated cart. */
export async function addCartItem({ productId, quantity }) {
	const response = await httpClient.post('/api/cart/items', { productId, quantity });
	return response.data;
}

/** Updates cart quantity; assumes the endpoint returns the full cart per §12. */
export async function updateCartItem({ itemId, quantity }) {
	// ASSUMPTION: see frontend-requirements §12
	const response = await httpClient.put(`/api/cart/items/${itemId}`, { quantity });
	return response.data;
}

/** Removes a cart line; assumes the endpoint returns the updated cart per §12. */
export async function removeCartItem(itemId) {
	// ASSUMPTION: see frontend-requirements §12
	const response = await httpClient.delete(`/api/cart/items/${itemId}`);
	return response.data;
}

/** Empties the cart; assumes the endpoint returns the empty cart per §12. */
export async function clearCart() {
	// ASSUMPTION: see frontend-requirements §12
	const response = await httpClient.delete('/api/cart');
	return response.data;
}