import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductImage from '../product/ProductImage.jsx';
import { Button } from '../ui/index.js';
import { formatPrice } from '../../utils/format.js';

/** Renders a cart line with availability and server-validated quantity controls. */
export default function CartLine({
  item,
  busy = false,
  onQuantityChange,
  onRemove,
}) {
  return (
    <article className="cart-line" data-available={item.available}>
      <Link className="cart-line__image" to={`/products/${item.productId}`}>
        <ProductImage
          src={item.imageUrl}
          alt={item.productName}
          name={item.productName}
        />
      </Link>
      <div className="cart-line__details">
        <h2>
          <Link to={`/products/${item.productId}`}>{item.productName}</Link>
        </h2>
        {!item.available && (
          <p className="cart-line__unavailable">No longer available</p>
        )}
        <p className="cart-line__unit-price">
          {formatPrice(item.unitPrice)} each
        </p>
      </div>
      <div
        className="cart-line__quantity"
        aria-label={`Quantity for ${item.productName}`}
      >
        <Button
          variant="secondary"
          aria-label={`Decrease ${item.productName} quantity`}
          disabled={!item.available || busy || item.quantity <= 1}
          onClick={() => onQuantityChange(item.itemId, item.quantity - 1)}
        >
          <Minus aria-hidden="true" size={16} />
        </Button>
        <output aria-live="polite">{item.quantity}</output>
        <Button
          variant="secondary"
          aria-label={`Increase ${item.productName} quantity`}
          disabled={!item.available || busy}
          onClick={() => onQuantityChange(item.itemId, item.quantity + 1)}
        >
          <Plus aria-hidden="true" size={16} />
        </Button>
      </div>
      <p className="cart-line__total">{formatPrice(item.lineTotal)}</p>
      <Button
        className="cart-line__remove"
        variant="ghost"
        aria-label={`Remove ${item.productName} from cart`}
        disabled={busy}
        onClick={() => onRemove(item.itemId)}
      >
        <Trash2 aria-hidden="true" size={18} />
      </Button>
    </article>
  );
}
