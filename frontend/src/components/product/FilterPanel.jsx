import { useEffect, useState } from 'react';
import { Button, Input } from '../ui/index.js';

/** Renders catalogue filters and validates price bounds before applying. */
export default function FilterPanel({
  categories,
  categoriesLoading = false,
  categoryId,
  minPrice,
  maxPrice,
  inStock,
  sort,
  onApply,
  idPrefix = 'filter',
}) {
  const [nextMinPrice, setNextMinPrice] = useState(minPrice);
  const [nextMaxPrice, setNextMaxPrice] = useState(maxPrice);
  const [priceError, setPriceError] = useState('');
  const priceErrorId = `${idPrefix}-price-error`;

  useEffect(() => {
    setNextMinPrice(minPrice);
    setNextMaxPrice(maxPrice);
  }, [maxPrice, minPrice]);

  function applyPrice() {
    const min = nextMinPrice === '' ? null : Number(nextMinPrice);
    const max = nextMaxPrice === '' ? null : Number(nextMaxPrice);
    if (min !== null && max !== null && min > max) {
      setPriceError('Minimum price must be no more than maximum price.');
      return;
    }
    setPriceError('');
    onApply({ minPrice: nextMinPrice, maxPrice: nextMaxPrice });
  }

  return (
    <div className="filter-panel">
      <div className="filter-panel__heading">
        <h2>Filters</h2>
      </div>
      <label className="filter-field" htmlFor={`${idPrefix}-category`}>
        Category
        <select
          id={`${idPrefix}-category`}
          className="ui-input"
          value={categoryId}
          disabled={categoriesLoading}
          onChange={(event) => onApply({ categoryId: event.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {categoriesLoading && (
          <span className="filter-field__hint">Loading categories</span>
        )}
      </label>
      <fieldset className="filter-field filter-field--price">
        <legend>Price range</legend>
        <div className="filter-field__range">
          <label htmlFor={`${idPrefix}-min-price`}>From</label>
          <Input
            id={`${idPrefix}-min-price`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={nextMinPrice}
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceError ? priceErrorId : undefined}
            onChange={(event) => setNextMinPrice(event.target.value)}
          />
          <label htmlFor={`${idPrefix}-max-price`}>To</label>
          <Input
            id={`${idPrefix}-max-price`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={nextMaxPrice}
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceError ? priceErrorId : undefined}
            onChange={(event) => setNextMaxPrice(event.target.value)}
          />
        </div>
        {priceError && (
          <span className="form-field__error" id={priceErrorId} role="alert">
            {priceError}
          </span>
        )}
        <Button variant="secondary" onClick={applyPrice}>
          Apply price
        </Button>
      </fieldset>
      <label className="filter-toggle" htmlFor={`${idPrefix}-in-stock`}>
        <input
          id={`${idPrefix}-in-stock`}
          type="checkbox"
          checked={inStock}
          onChange={(event) =>
            onApply({ inStock: event.target.checked ? 'true' : '' })
          }
        />
        In stock only
      </label>
      <label className="filter-field" htmlFor={`${idPrefix}-sort`}>
        Sort by
        <select
          id={`${idPrefix}-sort`}
          className="ui-input"
          value={sort}
          onChange={(event) => onApply({ sort: event.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
        </select>
      </label>
    </div>
  );
}
