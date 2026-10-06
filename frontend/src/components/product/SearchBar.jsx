import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/** Submits a catalogue keyword search to the URL. */
export default function SearchBar() {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');
  const navigate = useNavigate();

  useEffect(() => {
    setKeyword(searchParams.get('keyword') ?? '');
  }, [searchParams]);

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = keyword.trim();
    if (trimmed) params.set('keyword', trimmed);
    navigate(`/products${params.size ? `?${params}` : ''}`);
  }

  return (
    <form className="catalog-search" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="header-search">
        Search products
      </label>
      <input
        id="header-search"
        type="search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Search products"
      />
      <button type="submit" aria-label="Search products">
        <Search aria-hidden="true" size={18} />
      </button>
    </form>
  );
}
