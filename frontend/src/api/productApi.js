import httpClient from './httpClient.js';

/** Lists products using the supplied catalogue filters and pagination. */
export async function getProducts(params = {}) {
  const response = await httpClient.get('/api/products', { params });
  return response.data;
}

/** Fetches one product's catalogue detail. */
export async function getProduct(productId) {
  const response = await httpClient.get(`/api/products/${productId}`);
  return response.data;
}

/** Creates a catalogue product. */
export async function createProduct(product) {
  const response = await httpClient.post('/api/products', product);
  return response.data;
}

/** Updates a catalogue product. */
export async function updateProduct({ productId, product }) {
  const response = await httpClient.put(`/api/products/${productId}`, product);
  return response.data;
}

/** Deletes a catalogue product. */
export async function deleteProduct(productId) {
  return httpClient.delete(`/api/products/${productId}`);
}
