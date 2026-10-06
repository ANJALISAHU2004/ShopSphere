import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/format.js';
import { useCart } from '../hooks/useCart.js';
import { useAddresses, useAddAddress } from '../hooks/useAddresses.js';
import { ORDERS_QUERY_KEY, usePlaceOrder } from '../hooks/useOrders.js';
import { addressSchema, checkoutSchema } from '../validation/schemas.js';
import { PAYMENT_METHODS } from '../utils/constants.js';
import {
  Alert,
  Button,
  ErrorState,
  FormField,
  Input,
  Skeleton,
} from '../components/ui/index.js';

/** Places an order with address/payment selection and recoverable failures. */
export default function CheckoutPage() {
  const cart = useCart();
  const addressesQuery = useAddresses();
  const addAddressMutation = useAddAddress();
  const placeOrderMutation = usePlaceOrder();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [failure, setFailure] = useState(null);
  const paymentRef = useRef(null);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: { addressId: '', paymentMethod: 'CARD' },
  });

  const items = cart.data?.items ?? [];
  const addresses = Array.isArray(addressesQuery.data)
    ? addressesQuery.data
    : [];

  useEffect(() => {
    if (cart.isSuccess && items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cart.isSuccess, items.length, navigate]);

  useEffect(() => {
    if (!addressesQuery.isSuccess || getValues('addressId')) return;
    const preferredAddress =
      addresses.find((address) => address.isDefault) ?? addresses[0];
    if (preferredAddress) {
      setValue('addressId', String(preferredAddress.addressId), {
        shouldValidate: true,
      });
    }
  }, [addresses, addressesQuery.isSuccess, getValues, setValue]);

  async function onSubmit(values) {
    setFailure(null);
    try {
      const order = await placeOrderMutation.mutateAsync({
        addressId: Number(values.addressId),
        paymentMethod: values.paymentMethod,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart'] }),
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
      ]);
      navigate(`/orders/${order.orderId}`, {
        replace: true,
        state: { justPlaced: true },
      });
    } catch (error) {
      const message = error.message;
      const lowerMessage = message.toLowerCase();
      if (error.status === 402) {
        setFailure({
          kind: 'payment',
          message: 'Payment failed. Your order has not been placed.',
        });
        return;
      }

      if (error.status === 400) {
        if (lowerMessage.includes('cart is empty')) {
          setFailure({ kind: 'empty-cart', message });
          return;
        }
        if (lowerMessage.includes('address')) {
          await addressesQuery.refetch();
          setFailure({ kind: 'address', message });
          return;
        }
        if (lowerMessage.includes('no longer available')) {
          setFailure({ kind: 'stock', message });
          return;
        }
      }

      setFailure({
        kind: error.status === 503 ? 'unavailable' : 'general',
        message,
      });
    }
  }

  async function handleAddressAdded(address) {
    try {
      const savedAddress = await addAddressMutation.mutateAsync(address);
      setValue('addressId', String(savedAddress.addressId), {
        shouldValidate: true,
      });
      setShowAddressForm(false);
    } catch {
      return;
    }
  }

  if (cart.isPending || addressesQuery.isPending) {
    return (
      <section className="checkout-page" aria-labelledby="checkout-heading">
        <h1 id="checkout-heading">Checkout</h1>
        <Skeleton className="checkout-skeleton" label="Loading checkout" />
      </section>
    );
  }

  if (cart.isError) {
    return (
      <section className="checkout-page" aria-labelledby="checkout-heading">
        <h1 id="checkout-heading">Checkout</h1>
        <ErrorState
          message={cart.error.message}
          onRetry={() => cart.refetch()}
        />
      </section>
    );
  }

  if (addressesQuery.isError) {
    return (
      <section className="checkout-page" aria-labelledby="checkout-heading">
        <h1 id="checkout-heading">Checkout</h1>
        <ErrorState
          message={addressesQuery.error.message}
          onRetry={() => addressesQuery.refetch()}
        />
      </section>
    );
  }

  if (items.length === 0)
    return <Skeleton className="checkout-skeleton" label="Returning to cart" />;

  return (
    <section className="checkout-page" aria-labelledby="checkout-heading">
      <h1 id="checkout-heading">Checkout</h1>
      {failure && (
        <Alert>
          <span>{failure.message}</span>
          {failure.kind === 'empty-cart' && (
            <p>
              <Link to="/products">Browse products</Link>
            </p>
          )}
          {failure.kind === 'stock' && (
            <p>
              <Link to="/cart">Review your cart</Link>
            </p>
          )}
          {failure.kind === 'address' && (
            <p>
              Choose a saved address or add another address, then try again.
            </p>
          )}
          {failure.kind === 'payment' && (
            <div className="checkout-error__actions">
              <Button
                onClick={handleSubmit(onSubmit)}
                loading={placeOrderMutation.isPending}
              >
                Try again
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  paymentRef.current?.querySelector('input')?.focus()
                }
              >
                Change payment method
              </Button>
            </div>
          )}
          {failure.kind === 'unavailable' && (
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={placeOrderMutation.isPending}
            >
              Try again
            </Button>
          )}
          {failure.kind === 'general' && (
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={placeOrderMutation.isPending}
            >
              Try again
            </Button>
          )}
        </Alert>
      )}

      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <fieldset className="checkout-section">
            <legend>Delivery address</legend>
            {addresses.length > 0 ? (
              <div
                className="checkout-addresses"
                role="radiogroup"
                aria-label="Delivery address"
              >
                {addresses.map((address) => (
                  <label className="checkout-address" key={address.addressId}>
                    <input
                      type="radio"
                      value={String(address.addressId)}
                      aria-invalid={Boolean(errors.addressId)}
                      aria-describedby={
                        errors.addressId ? 'checkout-address-error' : undefined
                      }
                      {...register('addressId')}
                    />
                    <span className="checkout-address__copy">
                      <strong>{address.line1}</strong>
                      {address.line2 && <span>{address.line2}</span>}
                      <span>
                        {address.city}, {address.state} {address.pincode}
                      </span>
                    </span>
                    {address.isDefault && (
                      <span className="checkout-address__default">Default</span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p>No saved addresses. Add a delivery address to continue.</p>
            )}
            {errors.addressId && (
              <span className="form-field__error" id="checkout-address-error">
                {errors.addressId.message}
              </span>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowAddressForm((visible) => !visible)}
            >
              {showAddressForm ? 'Cancel' : 'Add a new address'}
            </Button>
            {showAddressForm && (
              <AddressForm
                loading={addAddressMutation.isPending}
                onCancel={() => setShowAddressForm(false)}
                onSubmit={handleAddressAdded}
                error={addAddressMutation.error}
              />
            )}
          </fieldset>

          <fieldset className="checkout-section" ref={paymentRef}>
            <legend>Payment method</legend>
            <div className="checkout-payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <label className="checkout-payment-method" key={method.value}>
                  <input
                    type="radio"
                    value={method.value}
                    aria-invalid={Boolean(errors.paymentMethod)}
                    aria-describedby={
                      errors.paymentMethod
                        ? 'checkout-payment-error'
                        : undefined
                    }
                    {...register('paymentMethod')}
                  />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <span className="form-field__error" id="checkout-payment-error">
                {errors.paymentMethod.message}
              </span>
            )}
            <p className="checkout-note">
              Payments are simulated in this demo.
            </p>
          </fieldset>

          <Button
            type="submit"
            loading={placeOrderMutation.isPending}
            loadingLabel="Placing order"
            disabled={items.some((item) => !item.available)}
          >
            Place order
          </Button>
        </form>

        <aside
          className="checkout-summary"
          aria-labelledby="checkout-summary-heading"
        >
          <h2 id="checkout-summary-heading">Order summary</h2>
          <ul>
            {items.map((item) => (
              <li key={item.itemId}>
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Items</dt>
              <dd>{cart.data.itemCount}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(cart.data.subtotal)}</dd>
            </div>
          </dl>
          {items.some((item) => !item.available) && (
            <p className="cart-summary__notice">
              Remove unavailable items from your <Link to="/cart">cart</Link>{' '}
              before placing an order.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

function AddressForm({ loading, onCancel, onSubmit, error }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema), mode: 'onBlur' });

  async function submit(values) {
    try {
      await onSubmit(values);
    } catch (apiError) {
      for (const [field, message] of Object.entries(
        apiError.fieldErrors ?? {},
      )) {
        setError(field, { type: 'server', message });
      }
    }
  }

  useEffect(() => {
    if (error?.fieldErrors) {
      for (const [field, message] of Object.entries(error.fieldErrors)) {
        setError(field, { type: 'server', message });
      }
    }
  }, [error, setError]);

  return (
    <div className="checkout-address-form">
      <h3>New delivery address</h3>
      {error && !Object.keys(error.fieldErrors ?? {}).length && (
        <Alert>{error.message}</Alert>
      )}
      <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
        <FormField
          label="Address line 1"
          htmlFor="checkout-line1"
          error={errors.line1}
        >
          <Input
            id="checkout-line1"
            autoComplete="address-line1"
            {...register('line1')}
          />
        </FormField>
        <FormField
          label="Address line 2 (optional)"
          htmlFor="checkout-line2"
          error={errors.line2}
        >
          <Input
            id="checkout-line2"
            autoComplete="address-line2"
            {...register('line2')}
          />
        </FormField>
        <FormField label="City" htmlFor="checkout-city" error={errors.city}>
          <Input
            id="checkout-city"
            autoComplete="address-level2"
            {...register('city')}
          />
        </FormField>
        <FormField label="State" htmlFor="checkout-state" error={errors.state}>
          <Input
            id="checkout-state"
            autoComplete="address-level1"
            {...register('state')}
          />
        </FormField>
        <FormField
          label="Pincode"
          htmlFor="checkout-pincode"
          error={errors.pincode}
        >
          <Input
            id="checkout-pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            {...register('pincode')}
          />
        </FormField>
        <div className="checkout-address-form__actions">
          <Button type="submit" loading={loading} loadingLabel="Saving address">
            Save address
          </Button>
          <Button variant="ghost" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
