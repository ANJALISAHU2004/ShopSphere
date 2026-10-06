import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/categoryApi.js';

/** Loads the normalized category list for the requested page. */
export function useCategoriesPage(params = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
  });
}

function useCategoryMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]),
  });
}

/** Creates a category and refreshes category and product data. */
export function useCreateCategory() {
  return useCategoryMutation(createCategory);
}

/** Updates a category and refreshes category and product data. */
export function useUpdateCategory() {
  return useCategoryMutation(updateCategory);
}

/** Deletes a category and refreshes category and product data. */
export function useDeleteCategory() {
  return useCategoryMutation(deleteCategory);
}
