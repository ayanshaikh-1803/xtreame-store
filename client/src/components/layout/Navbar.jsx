import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
  FiLogOut, FiSettings, FiShield
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.navbar__user')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="logo-icon-wrap">
            <span className="logo-icon-x">X</span>
          </span>
          <span className="logo-wordmark">
            <span className="logo-wordmark-top">
              <span className="logo-x">X</span>
              <span className="logo-text">TREAME</span>
            </span>
            <span className="logo-store">STORE</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar__links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/marketplace" className={location.pathname === '/marketplace' ? 'active' : ''}>Marketplace</Link></li>
          {isAdmin && (
            <li><Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>
              <FiShield /> Admin
            </Link></li>
          )}
        </ul>

        {/* Right Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/wishlist" className="navbar__icon-btn" title="Wishlist">
                <FiHeart />
              </Link>
              <Link to="/cart" className="navbar__icon-btn" title="Cart">
                <FiShoppingCart />
              </Link>
              <div className="navbar__user" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="navbar__avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="dropdown__header">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <Link to="/dashboard"><FiUser /> Dashboard</Link>
                    {isAdmin && <Link to="/admin"><FiShield /> Admin Panel</Link>}
                    <button onClick={handleLogout}><FiLogOut /> Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/cart">🛒 Cart</Link>
              <Link to="/wishlist">❤️ Wishlist</Link>
              {isAdmin && <Link to="/admin">⚙️ Admin Panel</Link>}
              <button onClick={handleLogout} className="mobile-logout">🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
