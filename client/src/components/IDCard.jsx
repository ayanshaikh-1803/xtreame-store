import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { cartAPI, wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';
import './IDCard.css';

const CATEGORY_COLORS = {
  'Basic ID': '#888',
  'Normal ID': '#4488ff',
  'Best ID': '#00cc66',
  'Super ID': '#ff8800',
  'Extreme ID': '#ff0033'
};

const IDCard = ({ id, onWishlistToggle }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Redirect to login and come back after login
  const requireLogin = (e) => {
    e.preventDefault();
    toast('Please login to continue', { icon: '🔐' });
    navigate('/login', { state: { from: `/id/${id._id}` } });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { requireLogin(e); return; }
    if (id.status === 'sold') return;
    setCartLoading(true);
    try {
      await cartAPI.add(id._id);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { requireLogin(e); return; }
    try {
      await wishlistAPI.toggle(id._id);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
      if (onWishlistToggle) onWishlistToggle(id._id);
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const categoryColor = CATEGORY_COLORS[id.category] || '#ff0033';
  const isSold = id.status === 'sold';

  return (
    <Link to={`/id/${id._id}`} className={`id-card ${isSold ? 'id-card--sold' : ''}`}>
      {/* Image */}
      <div className="id-card__image">
        {id.images?.[0] ? (
          <img
            src={id.images[0].url}
            alt={id.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerHTML = '<div class="id-card__placeholder"><span>🎮</span></div>';
            }}
          />
        ) : (
          <div className="id-card__placeholder">
            <span>🎮</span>
          </div>
        )}

        {/* Badges */}
        <div className="id-card__badges">
          {isSold ? (
            <span className="badge-sold">SOLD</span>
          ) : (
            <span className="badge-available">AVAILABLE</span>
          )}
          {id.featured && <span className="badge-featured">⭐ FEATURED</span>}
        </div>

        {/* Actions overlay */}
        <div className="id-card__overlay">
          <button
            className={`card-action-btn ${wishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlist}
            title="Wishlist"
          >
            <FiHeart />
          </button>
          {!isSold && (
            <button
              className="card-action-btn"
              onClick={handleAddToCart}
              disabled={cartLoading}
              title="Add to Cart"
            >
              <FiShoppingCart />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="id-card__info">
        <div className="id-card__category" style={{ color: categoryColor }}>
          {id.category}
        </div>
        <h3 className="id-card__title">{id.title}</h3>

        <div className="id-card__stats">
          <span>Lv. {id.level}</span>
          <span>🏆 {id.rank}</span>
          <span><FiEye /> {id.views}</span>
        </div>

        <div className="id-card__footer">
          <div className="id-card__price">
            ₹{id.price?.toLocaleString('en-IN')}
          </div>
          <div className="id-card__uid">UID: {id.uid}</div>
        </div>
      </div>
    </Link>
  );
};

export default IDCard;
