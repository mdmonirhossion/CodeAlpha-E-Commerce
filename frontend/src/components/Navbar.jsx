import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiSearch, FiLogOut, FiMoon, FiSun, FiMenu, FiGrid } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  // Set theme on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 border-b border-base-200 shadow-sm transition-all duration-300">
      {/* Brand Logo */}
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden p-1 mr-2">
            <FiMenu className="h-6 w-6" />
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Browse Shop</Link></li>
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Fashion">Fashion</Link></li>
            <li><Link to="/products?category=Accessories">Accessories</Link></li>
            <li><Link to="/products?category=Home Decor">Home Decor</Link></li>
          </ul>
        </div>
        <Link to="/" className="text-2xl font-black tracking-tight text-primary flex items-center gap-1">
          E<span className="text-secondary font-light">SHOP</span>
        </Link>
      </div>

      {/* Main Nav Items */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1 font-medium">
          <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li><Link to="/products" className="hover:text-primary transition-colors">Shop All</Link></li>
          <li className="dropdown dropdown-hover">
            <label tabIndex={0} className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
              Categories
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200 mt-0">
              <li><Link to="/products?category=Electronics">Electronics</Link></li>
              <li><Link to="/products?category=Fashion">Fashion</Link></li>
              <li><Link to="/products?category=Accessories">Accessories</Link></li>
              <li><Link to="/products?category=Home%20Decor">Home Decor</Link></li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Search & Action Buttons */}
      <div className="navbar-end gap-2 md:gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search products..."
            className="input input-sm input-bordered w-48 lg:w-64 rounded-full pl-8 pr-4 focus:w-80 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        </form>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm" aria-label="Toggle Theme">
          {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
        </button>

        {/* Shopping Cart */}
        <Link to="/cart" className="btn btn-ghost btn-circle btn-sm relative" aria-label="Cart">
          <div className="indicator">
            <FiShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="badge badge-sm badge-secondary indicator-item font-bold px-1.5 animate-pulse">
                {totalItems}
              </span>
            )}
          </div>
        </Link>

        {/* User Account / Login */}
        {user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar btn-sm border border-primary/20">
              <div className="w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
              <li className="px-4 py-2 border-b border-base-200">
                <span className="font-bold text-sm block truncate">{user.name}</span>
                <span className="text-xs text-gray-500 block truncate">{user.email}</span>
              </li>
              <li><Link to="/profile"><FiUser className="mr-1" /> Profile</Link></li>
              <li><Link to="/orders"><FiGrid className="mr-1" /> My Orders</Link></li>
              <li>
                <button onClick={logout} className="text-error hover:bg-error/10">
                  <FiLogOut className="mr-1" /> Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm rounded-full px-5 hidden sm:inline-flex">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
