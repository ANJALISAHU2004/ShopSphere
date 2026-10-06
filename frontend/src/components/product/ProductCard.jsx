import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import ProductActions from './ProductActions.jsx';
import { formatPrice } from '../../utils/format.js';

/** Renders a product summary without a rating or review count. */
export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link className="product-card__image-link" to={`/products/${product.id}`}>
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          name={product.name}
        />
      </Link>
      <div className="product-card__body">
        <p className="product-card__category">{product.categoryName}</p>
        <h2 className="product-card__name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h2>
        <p className="product-card__price">{formatPrice(product.price)}</p>
        {!product.inStock && (
          <span className="product-card__stock">Out of stock</span>
        )}
        <ProductActions product={product} cartDisabled={!product.inStock} />
      </div>
    </article>
  );
}
