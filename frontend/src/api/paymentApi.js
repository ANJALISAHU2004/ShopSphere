import httpClient from './httpClient.js';

/** Fetches payment details for an order owned by the authenticated customer. */
export async function getOrderPayment(orderId) {
  const response = await httpClient.get(`/api/payments/order/${orderId}`);
  return response.data;
}
