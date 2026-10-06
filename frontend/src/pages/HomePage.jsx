import { Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductImage from '../components/product/ProductImage.jsx';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/index.js';
import { useCategories, useProducts } from '../hooks/useProducts.js';
import { formatPrice } from '../utils/format.js';

/** Shows newest products and categories from the live catalogue. */
export default function HomePage() {
  const productsQuery = useProducts({ sort: 'newest', page: 0, size: 8 });
  const categoriesQuery = useCategories();
  const products = productsQuery.data?.content ?? [];
  const newest = products[0];
  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : [];

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-heading">
        {productsQuery.isPending ? (
          <Skeleton
            className="home-hero__skeleton"
            label="Loading newest product"
          />
        ) : newest ? (
          <>
            <div className="home-hero__copy">
              <p className="home-hero__category">{newest.categoryName}</p>
              <h1 id="home-heading">Meet the latest addition</h1>
              <p className="home-hero__name">{newest.name}</p>
              <p className="home-hero__price">{formatPrice(newest.price)}</p>
              <Link className="text-link" to={`/products/${newest.id}`}>
                View product
              </Link>
              <Link className="text-link" to="/products">
                Browse all products
              </Link>
            </div>
            <Link className="home-hero__image" to={`/products/${newest.id}`}>
              <ProductImage
                src={newest.imageUrl}
                alt={newest.name}
                name={newest.name}
              />
            </Link>
          </>
        ) : productsQuery.isError ? (
          <div className="home-hero__fallback">
            <h1 id="home-heading">Shop the catalogue</h1>
            <p>Newest products are unavailable right now.</p>
            <Link className="text-link" to="/products">
              Browse all products
            </Link>
            {categories.length > 0 && (
              <CategoryLinks
                categories={categories}
                title="Browse categories"
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="No products yet"
            description="Browse categories or check back when products are available."
            actionLabel="Browse all products"
            actionTo="/products"
          />
        )}
      </section>

      <section className="home-section" aria-labelledby="new-arrivals-heading">
        <div className="section-heading">
          <h2 id="new-arrivals-heading">New arrivals</h2>
          <Link to="/products?sort=newest">View all products</Link>
        </div>
        {productsQuery.isPending ? (
          <div className="product-grid" aria-label="Loading new arrivals">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton className="product-skeleton" key={index} />
            ))}
          </div>
        ) : productsQuery.isError ? (
          <ErrorState
            message={productsQuery.error.message}
            onRetry={() => productsQuery.refetch()}
          />
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="No new arrivals"
            description="There are no products to show yet."
            actionLabel="Browse products"
            actionTo="/products"
          />
        )}
      </section>

      <section className="home-section" aria-labelledby="category-heading">
        <div className="section-heading">
          <h2 id="category-heading">Shop by category</h2>
        </div>
        {categoriesQuery.isPending ? (
          <div className="category-grid" aria-label="Loading categories">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="category-skeleton" key={index} />
            ))}
          </div>
        ) : categoriesQuery.isError ? (
          <ErrorState
            message={categoriesQuery.error.message}
            onRetry={() => categoriesQuery.refetch()}
          />
        ) : categories.length > 0 ? (
          <CategoryLinks categories={categories} />
        ) : (
          <EmptyState
            title="No categories yet"
            description="Categories will appear here when available."
            actionLabel="Browse products"
            actionTo="/products"
          />
        )}
      </section>
    </div>
  );
}

/** Renders category links using the category identifiers from the API. */
function CategoryLinks({ categories, title }) {
  return (
    <div className="category-grid" aria-label={title ?? 'Product categories'}>
      {categories.map((category) => (
        <Link
          className="category-tile"
          key={category.id}
          to={`/products?categoryId=${encodeURIComponent(category.id)}`}
        >
          <span>{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
