import { useState } from 'react';
import AddressForm from './AddressForm.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Alert, Button, ErrorState, Skeleton } from '../ui/index.js';
import {
  useAddAddress,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '../../hooks/useAddresses.js';

/** Manages saved addresses, including default selection and confirmed deletion. */
export default function ProfileAddresses() {
  const addressesQuery = useAddresses();
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const defaultMutation = useSetDefaultAddress();
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(null);
  const [actionError, setActionError] = useState('');

  async function saveAddress(values) {
    if (editingAddress) {
      await updateMutation.mutateAsync({
        addressId: editingAddress.addressId,
        address: values,
      });
      setEditingAddress(null);
    } else {
      await addMutation.mutateAsync(values);
      setAddingAddress(false);
    }
    setActionError('');
  }

  async function deleteAddress() {
    setActionError('');
    try {
      await deleteMutation.mutateAsync(deletingAddress.addressId);
      setDeletingAddress(null);
    } catch (error) {
      setActionError(
        error?.message ?? 'Unable to delete this address. Try again.',
      );
    }
  }

  async function setDefaultAddress(addressId) {
    setActionError('');
    try {
      await defaultMutation.mutateAsync(addressId);
    } catch (error) {
      setActionError(
        error?.message ?? 'Unable to set the default address. Try again.',
      );
    }
  }

  return (
    <section
      className="profile-addresses"
      aria-labelledby="profile-addresses-heading"
    >
      <div className="profile-section-heading">
        <div>
          <h2 id="profile-addresses-heading">Saved addresses</h2>
          <p>Choose a default address for a quicker checkout.</p>
        </div>
        {!addingAddress && !editingAddress && (
          <Button
            onClick={() => {
              setActionError('');
              setAddingAddress(true);
            }}
          >
            Add address
          </Button>
        )}
      </div>
      {actionError && <Alert>{actionError}</Alert>}
      {addressesQuery.isPending ? (
        <div className="profile-addresses__loading">
          <Skeleton className="profile-address-skeleton" />
          <Skeleton className="profile-address-skeleton" />
        </div>
      ) : addressesQuery.isError ? (
        <ErrorState
          message={addressesQuery.error.message}
          onRetry={() => addressesQuery.refetch()}
        />
      ) : !Array.isArray(addressesQuery.data) ? (
        <Alert>
          Your addresses could not be displayed because the server returned an
          unexpected response.
        </Alert>
      ) : (
        <>
          {addressesQuery.data.length === 0 && !addingAddress && (
            <div className="profile-addresses__empty">
              <div>
                <h3>No saved addresses</h3>
                <p>Add an address to use it during checkout.</p>
              </div>
              <Button onClick={() => setAddingAddress(true)}>
                Add address
              </Button>
            </div>
          )}
          {addressesQuery.data.length > 0 && (
            <ul className="profile-address-list">
              {addressesQuery.data.map((address) => (
                <li className="profile-address" key={address.addressId}>
                  <div className="profile-address__text">
                    <div className="profile-address__title">
                      <strong>{address.line1}</strong>
                      {address.isDefault && (
                        <span className="profile-default-badge">Default</span>
                      )}
                    </div>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.pincode}
                    </p>
                  </div>
                  <div className="profile-address__actions">
                    {!address.isDefault && (
                      <Button
                        variant="secondary"
                        disabled={defaultMutation.isPending}
                        onClick={() => setDefaultAddress(address.addressId)}
                      >
                        Set as default
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setActionError('');
                        setAddingAddress(false);
                        setEditingAddress(address);
                      }}
                    >
                      Edit
                    </Button>
                    {addressesQuery.data.length === 1 ? (
                      <div className="profile-address__delete-rule">
                        <Button variant="danger" disabled>
                          Delete
                        </Button>
                        <span>You need at least one address.</span>
                      </div>
                    ) : (
                      <Button
                        variant="danger"
                        onClick={() => setDeletingAddress(address)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {(addingAddress || editingAddress) && (
            <div className="profile-address-editor">
              <h3>{editingAddress ? 'Edit address' : 'Add an address'}</h3>
              <AddressForm
                key={editingAddress?.addressId ?? 'new'}
                address={editingAddress}
                onSave={saveAddress}
                onCancel={() => {
                  setAddingAddress(false);
                  setEditingAddress(null);
                }}
                saveLabel={editingAddress ? 'Save address' : 'Add address'}
              />
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        open={Boolean(deletingAddress)}
        title="Delete this address?"
        confirmLabel="Delete address"
        cancelLabel="Keep address"
        pending={deleteMutation.isPending}
        onCancel={() => setDeletingAddress(null)}
        onConfirm={deleteAddress}
      >
        <p>This address will be removed from your saved addresses.</p>
      </ConfirmDialog>
    </section>
  );
}
