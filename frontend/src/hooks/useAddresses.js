import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addAddress as addAddressRequest,
  deleteAddress as deleteAddressRequest,
  getAddresses,
  setDefaultAddress as setDefaultAddressRequest,
  updateAddress as updateAddressRequest,
} from '../api/userApi.js';

export const ADDRESSES_QUERY_KEY = ['addresses'];

/** Loads the authenticated customer's saved addresses. */
export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: getAddresses,
  });
}

/** Invalidates the saved-address list after an address mutation. */
function useRefreshAddresses(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY }),
  });
}

/** Adds an address and refreshes the address-list cache. */
export function useAddAddress() {
  return useRefreshAddresses(addAddressRequest);
}

/** Updates an address and refreshes the address-list cache. */
export function useUpdateAddress() {
  return useRefreshAddresses(({ addressId, address }) =>
    updateAddressRequest(addressId, address),
  );
}

/** Deletes an address and refreshes the address-list cache. */
export function useDeleteAddress() {
  return useRefreshAddresses(deleteAddressRequest);
}

/** Sets the default address and refreshes the address-list cache. */
export function useSetDefaultAddress() {
  return useRefreshAddresses(setDefaultAddressRequest);
}
