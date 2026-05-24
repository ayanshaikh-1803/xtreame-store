import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiHeart, FiUser, FiArrowLeft } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="dashboard page-enter">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
          <FiArrowLeft /> Back
        </button>
        <div className="dashboard__header">
          <div className="dashboard__avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="dashboard__name">{user?.name}</h1>
            <p className="dashboard__email">{user?.email}</p>
            <span className={`dashboard__badge ${user?.isVerified ? 'verified' : 'unverified'}`}>
              {user?.isVerified ? '✓ Verified' : '✗ Unverified'}
            </span>
          </div>
        </div>

        <div className="dashboard__cards">
          <Link to="/cart" className="dash-card glass-card">
            <FiShoppingCart className="dash-card__icon" />
            <h3>My Cart</h3>
            <p>View saved IDs in your cart</p>
          </Link>
          <Link to="/wishlist" className="dash-card glass-card">
            <FiHeart className="dash-card__icon" />
            <h3>Wishlist</h3>
            <p>IDs you've saved for later</p>
          </Link>
          <div className="dash-card glass-card" onClick={logout} style={{ cursor: 'pointer' }}>
            <FiUser className="dash-card__icon" />
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
