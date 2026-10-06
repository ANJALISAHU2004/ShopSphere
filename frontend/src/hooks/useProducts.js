import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '../api/categoryApi.js';
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../api/productApi.js';

/** Loads a filtered, paginated product catalogue. */
export function useProducts(params, options = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    enabled: options.enabled ?? true,
  });
}

/** Loads product detail for a product route. */
export function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });
}

/** Loads the public category list. */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}

function useProductMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (product) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
      ]);
      if (product?.id) {
        queryClient.setQueryData(['product', String(product.id)], product);
      }
    },
  });
}

/** Creates a product and refreshes product list caches. */
export function useCreateProduct() {
  return useProductMutation(createProduct);
}

/** Updates a product and refreshes product caches. */
export function useUpdateProduct() {
  return useProductMutation(updateProduct);
}

/** Deletes a product and refreshes product caches. */
export function useDeleteProduct() {
  return useProductMutation(deleteProduct);
}
