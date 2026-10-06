import httpClient from './httpClient.js';

/** Lists the authenticated customer's paginated order summaries. */
export async function getOrders({ page = 0, size = 12 } = {}) {
  const response = await httpClient.get('/api/orders', {
    params: { page, size },
  });
  return response.data;
}

/** Lists all orders for the admin order-management screen. */
export async function getAdminOrders({ page = 0, size = 12 } = {}) {
  const response = await httpClient.get('/api/orders/admin/all', {
    params: { page, size },
  });
  return response.data;
}

/** Advances an order to a valid next status. */
export async function updateAdminOrderStatus({ orderId, status }) {
  const response = await httpClient.patch(
    `/api/orders/admin/${orderId}/status`,
    { status },
  );
  return response.data;
}

/** Places an order using the selected address and simulated payment method. */
export async function createOrder({ addressId, paymentMethod }) {
  const response = await httpClient.post('/api/orders', {
    addressId,
    paymentMethod,
  });
  return response.data;
}

/** Fetches one order and its historical item/address snapshots. */
export async function getOrder(orderId) {
  // ASSUMPTION: see frontend-requirements §12; same shape as checkout 201 plus status.
  const response = await httpClient.get(`/api/orders/${orderId}`);
  return response.data;
}

/** Cancels an eligible order before it ships. */
export async function cancelOrder(orderId) {
  const response = await httpClient.patch(`/api/orders/${orderId}/cancel`);
  return response.data;
}
