import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	addCartItem,
	clearCart as clearCartRequest,
	getCart,
	removeCartItem,
	updateCartItem,
} from '../api/cartApi.js';
import useAuth from './useAuth.js';

export const CART_QUERY_KEY = ['cart'];

/** Loads and mutates the authenticated customer's cart. */
export function useCart() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	const enabled = session?.role === 'CUSTOMER';
	const cartQuery = useQuery({
		queryKey: CART_QUERY_KEY,
		queryFn: getCart,
		enabled,
	});

	function syncCart(cart) {
		if (cart && Array.isArray(cart.items)) {
			queryClient.setQueryData(CART_QUERY_KEY, cart);
		} else {
			queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
		}
	}

	const addMutation = useMutation({
		mutationFn: addCartItem,
		onSuccess: (cart) => {
			syncCart(cart);
			toast.success('Added to cart');
		},
		onError: (error) => toast.error(error.message),
	});
	const updateMutation = useMutation({
		mutationFn: updateCartItem,
		onSuccess: (cart) => syncCart(cart),
		onError: (error) => toast.error(error.message),
	});
	const removeMutation = useMutation({
		mutationFn: removeCartItem,
		onSuccess: (cart) => syncCart(cart),
		onError: (error) => toast.error(error.message),
	});
	const clearMutation = useMutation({
		mutationFn: clearCartRequest,
		onSuccess: (cart) => {
			syncCart(cart);
			toast.success('Cart emptied');
		},
		onError: (error) => toast.error(error.message),
	});

	return {
		...cartQuery,
		addItem: addMutation.mutateAsync,
		isAdding: addMutation.isPending,
		updateItem: updateMutation.mutateAsync,
		updatingItemId: updateMutation.variables?.itemId ?? null,
		isUpdating: updateMutation.isPending,
		removeItem: removeMutation.mutateAsync,
		removingItemId: removeMutation.variables ?? null,
		isRemoving: removeMutation.isPending,
		clear: clearMutation.mutateAsync,
		isClearing: clearMutation.isPending,
	};
}