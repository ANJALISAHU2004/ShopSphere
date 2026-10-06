import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, UserRound } from 'lucide-react';
import { Button } from '../ui/index.js';
import SearchBar from '../product/SearchBar.jsx';
import useAuth from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { useWishlist } from '../../hooks/useWishlist.js';

/** Renders shared navigation and role-aware account actions. */
export default function Header() {
  const { session, isAdmin, logout } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        ShopSphere
      </Link>
      <SearchBar />
      <nav aria-label="Main navigation">
        <Link to="/products">Products</Link>
        {session?.role === 'CUSTOMER' && (
          <>
            <Link
              className="header-count-link"
              to="/wishlist"
              aria-label={`Wishlist, ${wishlist.data?.itemCount ?? 0} items`}
            >
              <Heart aria-hidden="true" size={19} />
              <span className="header-count-link__label">Wishlist</span>
              <span className="header-count-link__badge">
                {wishlist.data?.itemCount ?? 0}
              </span>
            </Link>
            <Link
              className="header-count-link"
              to="/cart"
              aria-label={`Cart, ${cart.data?.itemCount ?? 0} items`}
            >
              <ShoppingCart aria-hidden="true" size={19} />
              <span className="header-count-link__label">Cart</span>
              <span className="header-count-link__badge">
                {cart.data?.itemCount ?? 0}
              </span>
            </Link>
          </>
        )}
        {!session && (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
          </>
        )}
        {session && (
          <details className="account-menu">
            <summary className="account-menu__trigger">
              <UserRound aria-hidden="true" size={18} />
              <span>{isAdmin ? 'Admin' : session.firstName}</span>
            </summary>
            <div className="account-menu__panel">
              {isAdmin ? (
                <>
                  <Link to="/admin/products">Products</Link>
                  <Link to="/admin/orders">Orders</Link>
                </>
              ) : (
                <>
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">Orders</Link>
                </>
              )}
              <Button
                variant="ghost"
                loading={loggingOut}
                loadingLabel="Logging out"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          </details>
        )}
      </nav>
    </header>
  );
}
