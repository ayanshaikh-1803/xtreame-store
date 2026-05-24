import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import IDCard from '../components/IDCard';
import toast from 'react-hot-toast';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistAPI.get()
      .then((res) => setWishlist(res.data.wishlist))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (idId) => {
    setWishlist(wishlist.filter((id) => id._id !== idId));
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-enter" style={{ padding: '100px 0 80px' }}>
      <div className="container">
        <div className="page-header">
          <div>
            <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>
              <FiArrowLeft /> Back
            </button>
            <h1 style={{ fontFamily: 'var(--font-gaming)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiHeart /> My Wishlist
            </h1>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <span>💔</span>
            <h3>Your wishlist is empty</h3>
            <p>Save IDs you like by clicking the heart icon</p>
            <Link to="/marketplace" className="btn-primary" style={{ marginTop: '20px' }}>Browse IDs</Link>
          </div>
        ) : (
          <div className="ids-grid">
            {wishlist.map((id) => (
              <IDCard key={id._id} id={id} onWishlistToggle={handleToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
