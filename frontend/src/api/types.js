/** @typedef {{ token: string, userId: number, email: string, firstName: string, role: 'CUSTOMER' | 'ADMIN', expiresIn: number }} LoginResponse */
/** @typedef {{ token: string, userId: number, email: string, firstName: string, role: 'CUSTOMER' | 'ADMIN', expiresAt: number }} Session */
/** @typedef {{ id: number, firstName: string, lastName: string, email: string, phone: string }} User */
/** @typedef {{ id: number, firstName: string, lastName: string, email: string, phone: string }} RegisterResponse */
/** @typedef {{ addressId: number, line1: string, line2?: string, city: string, state: string, pincode: string, isDefault: boolean }} Address */
/** @typedef {{ status: number | null, message: string, fieldErrors: Record<string, string> }} ApiError */
/** @typedef {{ itemId: number, productId: number, productName: string, unitPrice: number, quantity: number, lineTotal: number, imageUrl: string, available: boolean }} CartItem */
/** @typedef {{ cartId: number, items: CartItem[], itemCount: number, subtotal: number }} Cart */
/** @typedef {{ itemId: number, productId: number, productName: string, price: number, imageUrl: string, inStock: boolean, addedAt: string }} WishlistItem */
/** @typedef {{ items: WishlistItem[], itemCount: number }} Wishlist */
/** @typedef {{ orderId: number, status: string, totalAmount: number, itemCount: number, placedAt: string }} OrderSummary */
/** @typedef {{ productId: number, productName: string, unitPrice: number, quantity: number, lineTotal: number }} OrderItemSnapshot */
/** @typedef {{ line1: string, line2?: string, city: string, state: string, pincode: string }} DeliveryAddressSnapshot */
/** @typedef {{ orderId: number, status: string, totalAmount: number, placedAt: string, paymentStatus: string, transactionRef: string, deliveryAddress: DeliveryAddressSnapshot, items: OrderItemSnapshot[] }} OrderResponse */
/** @typedef {{ paymentId: number, orderId: number, amount: number, paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING' | 'CASH_ON_DELIVERY', status: string, transactionRef?: string, processedAt: string }} PaymentResponse */

export {};
