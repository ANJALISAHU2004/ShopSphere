import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterPanel from '../components/product/FilterPanel.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
} from '../components/ui/index.js';
import useDebounce from '../hooks/useDebounce.js';
import { useCategories, useProducts } from '../hooks/useProducts.js';

const PAGE_SIZE = 12;
const SORT_VALUES = new Set(['newest', 'priceAsc', 'priceDesc']);

/** Renders a product catalogue whose filters are encoded in the URL. */
export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(
    searchParams.get('keyword') ?? '',
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterDialog = useRef(null);

  useEffect(() => {
    setKeywordInput(searchParams.get('keyword') ?? '');
  }, [searchParams]);

  const debouncedKeyword = useDebounce(keywordInput, 400);
  useEffect(() => {
    const currentKeyword = searchParams.get('keyword') ?? '';
    const nextKeyword = debouncedKeyword.trim();
    if (currentKeyword === nextKeyword) return;
    const nextParams = new URLSearchParams(searchParams);
    if (nextKeyword) nextParams.set('keyword', nextKeyword);
    else nextParams.delete('keyword');
    nextParams.set('page', '0');
    setSearchParams(nextParams);
  }, [debouncedKeyword, searchParams, setSearchParams]);

  useEffect(() => {
    const dialog = filterDialog.current;
    if (!dialog) return;
    if (filtersOpen && !dialog.open) dialog.showModal();
    if (!filtersOpen && dialog.open) dialog.close();
  }, [filtersOpen]);

  const categoryId = searchParams.get('categoryId') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const inStock = searchParams.get('inStock') === 'true';
  const requestedSort = searchParams.get('sort') ?? 'newest';
  const sort = SORT_VALUES.has(requestedSort) ? requestedSort : 'newest';
  const page = Math.max(
    0,
    Number.parseInt(searchParams.get('page') ?? '0', 10) || 0,
  );
  const minValue = minPrice === '' ? null : Number(minPrice);
  const maxValue = maxPrice === '' ? null : Number(maxPrice);
  const invalidRange =
    (minValue !== null && !Number.isFinite(minValue)) ||
    (maxValue !== null && !Number.isFinite(maxValue)) ||
    (minValue !== null && minValue < 0) ||
    (maxValue !== null && maxValue < 0) ||
    (minValue !== null && maxValue !== null && minValue > maxValue);
  const queryParams = {
    ...(searchParams.get('keyword')
      ? { keyword: searchParams.get('keyword') }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
    ...(inStock ? { inStock: true } : {}),
    sort,
    page,
    size: PAGE_SIZE,
  };
  const productsQuery = useProducts(queryParams, { enabled: !invalidRange });
  const categoriesQuery = useCategories();
  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : [];
  const products = productsQuery.data?.content ?? [];
  const totalElements = productsQuery.data?.totalElements ?? 0;
  const totalPages = productsQuery.data?.totalPages ?? 0;

  function updateParams(changes, { resetPage = true } = {}) {
    const nextParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === '' || value === null || value === undefined)
        nextParams.delete(key);
      else nextParams.set(key, String(value));
    }
    if (resetPage) nextParams.set('page', '0');
    setSearchParams(nextParams);
  }

  function removeFilter(key) {
    updateParams({ [key]: '' });
    if (key === 'keyword') setKeywordInput('');
  }

  function clearFilters() {
    setKeywordInput('');
    setSearchParams({});
  }

  const selectedCategory = categories.find(
    (category) => String(category.id) === categoryId,
  );
  const activeFilters = [
    searchParams.get('keyword') && {
      key: 'keyword',
      label: `Search: ${searchParams.get('keyword')}`,
    },
    categoryId && {
      key: 'categoryId',
      label: selectedCategory?.name ?? `Category ${categoryId}`,
    },
    minPrice && { key: 'minPrice', label: `From ₹${minPrice}` },
    maxPrice && { key: 'maxPrice', label: `Up to ₹${maxPrice}` },
    inStock && { key: 'inStock', label: 'In stock' },
    requestedSort !== 'newest' && {
      key: 'sort',
      label: `Sort: ${requestedSort}`,
    },
  ].filter(Boolean);

  const filterProps = {
    categories,
    categoriesLoading: categoriesQuery.isPending,
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    sort,
    onApply: (changes) => updateParams(changes),
  };

  return (
    <section className="catalog-page" aria-labelledby="catalog-heading">
      <div className="catalog-heading">
        <div>
          <h1 id="catalog-heading">Products</h1>
          <p>
            {invalidRange
              ? 'Check the selected price range.'
              : `${totalElements} products`}
          </p>
        </div>
        <Button
          className="catalog-mobile-filter-button"
          onClick={() => setFiltersOpen(true)}
        >
          Filters
        </Button>
      </div>

      <label className="catalog-keyword" htmlFor="catalog-keyword">
        Search products
        <Input
          id="catalog-keyword"
          type="search"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="Name or description"
        />
      </label>

      {activeFilters.length > 0 && (
        <div className="active-filters" aria-label="Active filters">
          {activeFilters.map((filter) => (
            <button
              className="filter-chip"
              key={filter.key}
              type="button"
              onClick={() => removeFilter(filter.key)}
              aria-label={`Remove ${filter.label} filter`}
            >
              {filter.label} <span aria-hidden="true">×</span>
            </button>
          ))}
          <Button variant="ghost" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {categoriesQuery.isError && (
        <ErrorState
          message={categoriesQuery.error.message}
          onRetry={() => categoriesQuery.refetch()}
        />
      )}

      <div className="catalog-layout">
        <aside className="catalog-filters" aria-label="Product filters">
          <FilterPanel {...filterProps} idPrefix="desktop-filter" />
        </aside>

        <div className="catalog-results" aria-live="polite">
          {invalidRange ? (
            <p className="catalog-validation" role="alert">
              Minimum price must be no more than maximum price. Update the range
              to see products.
            </p>
          ) : productsQuery.isPending ? (
            <div className="product-grid" aria-label="Loading products">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <Skeleton className="product-skeleton" key={index} />
              ))}
            </div>
          ) : productsQuery.isError ? (
            <ErrorState
              message={productsQuery.error.message}
              onRetry={() => productsQuery.refetch()}
            />
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Product pages">
                  <Button
                    variant="secondary"
                    disabled={page <= 0}
                    onClick={() =>
                      updateParams({ page: page - 1 }, { resetPage: false })
                    }
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page + 1 >= totalPages}
                    onClick={() =>
                      updateParams({ page: page + 1 }, { resetPage: false })
                    }
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              title="No products match these filters"
              description="Clear the filters to browse the full catalogue."
              actionLabel="Clear filters"
              actionTo="/products"
            />
          )}
        </div>
      </div>

      <dialog
        className="filter-dialog"
        ref={filterDialog}
        onCancel={() => setFiltersOpen(false)}
        onClose={() => setFiltersOpen(false)}
        aria-labelledby="mobile-filter-heading"
      >
        <div className="filter-dialog__header">
          <h2 id="mobile-filter-heading">Filters</h2>
          <Button variant="ghost" onClick={() => setFiltersOpen(false)}>
            Close
          </Button>
        </div>
        <FilterPanel {...filterProps} idPrefix="mobile-filter" />
        <Button onClick={() => setFiltersOpen(false)}>Show products</Button>
      </dialog>
    </section>
  );
}
