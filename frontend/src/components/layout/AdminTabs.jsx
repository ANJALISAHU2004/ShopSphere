import { Link, useLocation } from 'react-router-dom';

/** Renders shared administrator navigation for products, categories, and orders. */
export default function AdminTabs() {
  const location = useLocation();
  const isCategories =
    location.pathname === '/admin/products' &&
    new URLSearchParams(location.search).get('tab') === 'categories';
  const links = [
    {
      label: 'Products',
      to: '/admin/products',
      active: location.pathname === '/admin/products' && !isCategories,
    },
    {
      label: 'Categories',
      to: '/admin/products?tab=categories',
      active: isCategories,
    },
    {
      label: 'Orders',
      to: '/admin/orders',
      active: location.pathname === '/admin/orders',
    },
  ];

  return (
    <nav className="admin-tabs" aria-label="Admin sections">
      {links.map((link) => (
        <Link
          aria-current={link.active ? 'page' : undefined}
          className="admin-tabs__link"
          key={link.label}
          to={link.to}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
