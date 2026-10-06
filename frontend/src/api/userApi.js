import httpClient from './httpClient.js';

/** Registers a user and normalizes the response identifier to id. */
export async function registerUser(details) {
  const response = await httpClient.post('/api/users/register', details);
  const { userId, ...user } = response.data;
  return { ...user, id: user.id ?? userId };
}

/** Fetches the authenticated user's profile. */
export async function getProfile() {
  const response = await httpClient.get('/api/users/me');
  return response.data;
}

/** Updates the authenticated user's editable profile fields. */
export async function updateProfile(profile) {
  const response = await httpClient.put('/api/users/me', profile);
  return response.data;
}

/** Lists addresses belonging to the authenticated user. */
export async function getAddresses() {
  const response = await httpClient.get('/api/users/me/addresses');
  return response.data;
}

/** Adds an address without sending the server-managed isDefault field. */
export async function addAddress(address) {
  const { line1, line2, city, state, pincode } = address;
  const response = await httpClient.post('/api/users/me/addresses', {
    line1,
    line2,
    city,
    state,
    pincode,
  });
  return response.data;
}

/** Updates an address without sending the server-managed isDefault field. */
export async function updateAddress(addressId, address) {
  const { line1, line2, city, state, pincode } = address;
  const response = await httpClient.put(
    `/api/users/me/addresses/${addressId}`,
    {
      line1,
      line2,
      city,
      state,
      pincode,
    },
  );
  return response.data;
}

/** Deletes an address belonging to the authenticated user. */
export async function deleteAddress(addressId) {
  return httpClient.delete(`/api/users/me/addresses/${addressId}`);
}

/** Marks an address as the authenticated user's default address. */
export async function setDefaultAddress(addressId) {
  const response = await httpClient.patch(
    `/api/users/me/addresses/${addressId}/default`,
    { isDefault: true },
  );
  return response.data;
}
