import { useSearchParams } from 'react-router-dom';
import CategoryManager from '../components/admin/CategoryManager.jsx';
import ProductManager from '../components/admin/ProductManager.jsx';
import AdminTabs from '../components/layout/AdminTabs.jsx';

/** Composes administrator product and category management. */
export default function AdminProductsPage() {
  const [searchParams] = useSearchParams();
  const showCategories = searchParams.get('tab') === 'categories';

  return (
    <section className="admin-page" aria-labelledby="admin-products-title">
      <header className="admin-page__header">
        <h1 id="admin-products-title">Product catalogue</h1>
      </header>
      <AdminTabs />
      {showCategories ? <CategoryManager /> : <ProductManager />}
    </section>
  );
}
