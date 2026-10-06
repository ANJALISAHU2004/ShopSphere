import httpClient from './httpClient.js';

/** Lists catalogue categories, normalizing the paginated API envelope. */
export async function getCategories({ page = 0, size = 100 } = {}) {
  const response = await httpClient.get('/api/categories', {
    params: { page, size },
  });
  return response.data?.content ?? response.data;
}

/** Creates a catalogue category. */
export async function createCategory(category) {
  const response = await httpClient.post('/api/categories', category);
  return response.data;
}

/** Updates a catalogue category. */
export async function updateCategory({ categoryId, category }) {
  const response = await httpClient.put(
    `/api/categories/${categoryId}`,
    category,
  );
  return response.data;
}

/** Deletes a catalogue category. */
export async function deleteCategory(categoryId) {
  return httpClient.delete(`/api/categories/${categoryId}`);
}
