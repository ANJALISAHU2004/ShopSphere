import ProductCard from './ProductCard.jsx';

/** Renders product cards in the responsive catalogue grid. */
export default function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
