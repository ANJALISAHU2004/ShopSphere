import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getOrderPayment } from '../api/paymentApi.js';
import {
  cancelOrder,
  createOrder,
  getAdminOrders,
  getOrder,
  getOrders,
  updateAdminOrderStatus,
} from '../api/orderApi.js';

export const ORDERS_QUERY_KEY = ['orders'];

/** Loads the customer's paginated orders. */
export function useOrders({ page = 0, size = 12 } = {}) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, page, size],
    queryFn: () => getOrders({ page, size }),
  });
}

/** Loads all orders for the administrator's paginated order table. */
export function useAdminOrders({ page = 0, size = 12 } = {}) {
  return useQuery({
    queryKey: ['admin-orders', page, size],
    queryFn: () => getAdminOrders({ page, size }),
  });
}

/** Updates an order status and refreshes admin/customer order caches. */
export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminOrderStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
      ]);
    },
  });
}

/** Loads a single order using its route identifier. */
export function useOrder(orderId) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
  });
}

/** Loads payment details associated with an order. */
export function useOrderPayment(orderId, enabled = true) {
  return useQuery({
    queryKey: ['order-payment', orderId],
    queryFn: () => getOrderPayment(orderId),
    enabled: Boolean(orderId) && enabled,
  });
}

/** Places an order and keeps order-list data fresh. */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
  });
}

/** Cancels an order and refreshes its detail and list caches. */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: async (_order, orderId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
      ]);
      toast.success('Order cancelled');
    },
    onError: (error) => toast.error(error.message),
  });
}
