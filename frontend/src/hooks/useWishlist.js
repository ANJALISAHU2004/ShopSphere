import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  addWishlistItem,
  getWishlist,
  moveWishlistItemToCart,
  removeWishlistItem,
} from '../api/wishlistApi.js';
import { CART_QUERY_KEY } from './useCart.js';
import useAuth from './useAuth.js';

export const WISHLIST_QUERY_KEY = ['wishlist'];

/** Loads and mutates the authenticated customer's wishlist. */
export function useWishlist() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const enabled = session?.role === 'CUSTOMER';
  const wishlistQuery = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: getWishlist,
    enabled,
  });

  async function syncWishlist(wishlist) {
    if (wishlist && Array.isArray(wishlist.items)) {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, wishlist);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
  }

  const addMutation = useMutation({
    mutationFn: addWishlistItem,
    onSuccess: async (wishlist) => {
      await syncWishlist(wishlist);
      toast.success('Added to wishlist');
    },
    onError: (error) => {
      toast.error(
        error.status === 409 ? 'Already in your wishlist' : error.message,
      );
    },
  });
  const removeMutation = useMutation({
    mutationFn: removeWishlistItem,
    onSuccess: async (wishlist) => {
      await syncWishlist(wishlist);
      toast.success('Removed from wishlist');
    },
    onError: (error) => toast.error(error.message),
  });
  const moveMutation = useMutation({
    mutationFn: moveWishlistItemToCart,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
      ]);
      toast.success('Moved to cart');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    ...wishlistQuery,
    addItem: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    removeItem: removeMutation.mutateAsync,
    removingItemId: removeMutation.variables ?? null,
    isRemoving: removeMutation.isPending,
    moveToCart: moveMutation.mutateAsync,
    movingItemId: moveMutation.variables ?? null,
    isMoving: moveMutation.isPending,
  };
}
