import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer.jsx';
import Header from './Header.jsx';

const PAGE_TITLES = {
  '/': 'Home',
  '/products': 'Products',
  '/login': 'Sign in',
  '/register': 'Create account',
  '/cart': 'Your cart',
  '/wishlist': 'Your wishlist',
  '/checkout': 'Checkout',
  '/orders': 'Your orders',
  '/profile': 'Your profile',
  '/admin/products': 'Product catalogue',
  '/admin/orders': 'Order management',
};

/** Provides the shared header, main landmark and footer. */
export default function AppLayout() {
  const { pathname, search } = useLocation();
  const showCategories = new URLSearchParams(search).get('tab') === 'categories';
  const pageTitle =
    pathname === '/products'
      ? PAGE_TITLES[pathname]
      : pathname.startsWith('/products/')
        ? 'Product details'
        : pathname.startsWith('/orders/')
          ? 'Order details'
          : pathname === '/admin/products' && showCategories
            ? 'Categories'
            : (PAGE_TITLES[pathname] ?? 'Page not found');

  useEffect(() => {
    document.title = `${pageTitle} | ShopSphere`;
  }, [pageTitle]);

  return (
    <div className="app-shell">
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
