import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  FiPlus, FiList, FiUsers, FiEye,
  FiPackage, FiCheckCircle, FiXCircle, FiTrendingUp, FiArrowLeft
} from 'react-icons/fi';
import './Admin.css';

const CATEGORY_COLORS = {
  'Basic ID':   '#888',
  'Normal ID':  '#4488ff',
  'Best ID':    '#00cc66',
  'Super ID':   '#ff8800',
  'Extreme ID': '#ff0033'
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then((res) => setAnalytics(res.data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="admin-page page-enter">
      <div className="container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <button className="back-btn" onClick={() => navigate('/')} style={{ marginBottom: '10px' }}>
              <FiArrowLeft /> Home
            </button>
            <h1>⚙️ Admin Dashboard</h1>
            <p>Welcome back! Here's your store overview.</p>
          </div>
          <Link to="/admin/add-id" className="btn-primary">
            <FiPlus /> Add New ID
          </Link>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────────── */}
        <div className="admin-stats">
          <div className="stat-card glass-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(255,0,51,0.1)' }}>
              <FiPackage style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <strong>{analytics?.totalIDs || 0}</strong>
              <span>Total IDs</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(0,255,136,0.1)' }}>
              <FiCheckCircle style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <strong style={{ color: 'var(--success)' }}>{analytics?.availableIDs || 0}</strong>
              <span>Available</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(255,68,68,0.1)' }}>
              <FiXCircle style={{ color: 'var(--sold)' }} />
            </div>
            <div>
              <strong style={{ color: 'var(--sold)' }}>{analytics?.soldIDs || 0}</strong>
              <span>Sold</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(68,136,255,0.1)' }}>
              <FiUsers style={{ color: '#4488ff' }} />
            </div>
            <div>
              <strong style={{ color: '#4488ff' }}>{analytics?.totalUsers || 0}</strong>
              <span>Users</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(255,170,0,0.1)' }}>
              <FiEye style={{ color: '#ffaa00' }} />
            </div>
            <div>
              <strong style={{ color: '#ffaa00' }}>{analytics?.totalViews || 0}</strong>
              <span>Total Views</span>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <div className="admin-actions">
          <Link to="/admin/add-id" className="admin-action-card glass-card">
            <div className="action-icon-wrap"><FiPlus /></div>
            <h3>Add New ID</h3>
            <p>List a new Free Fire account</p>
          </Link>
          <Link to="/admin/manage-ids" className="admin-action-card glass-card">
            <div className="action-icon-wrap"><FiList /></div>
            <h3>Manage IDs</h3>
            <p>Edit, delete, mark sold</p>
          </Link>
          <Link to="/admin/users" className="admin-action-card glass-card">
            <div className="action-icon-wrap"><FiUsers /></div>
            <h3>Users</h3>
            <p>View & manage all users</p>
          </Link>
        </div>

        <div className="dashboard-bottom-grid">
          {/* ── Category Stats ────────────────────────────────────────────── */}
          {analytics?.categoryStats?.length > 0 && (
            <div className="admin-section">
              <h2><FiTrendingUp /> IDs by Category</h2>
              <div className="category-stats glass-card">
                {analytics.categoryStats.map((cat) => (
                  <div key={cat._id} className="cat-stat-row">
                    <span style={{ color: CATEGORY_COLORS[cat._id] || '#fff' }}>
                      {cat._id}
                    </span>
                    <div className="cat-bar">
                      <div
                        className="cat-bar-fill"
                        style={{
                          width: `${(cat.count / analytics.totalIDs) * 100}%`,
                          background: CATEGORY_COLORS[cat._id] || 'var(--primary)'
                        }}
                      />
                    </div>
                    <strong style={{ color: CATEGORY_COLORS[cat._id] || '#fff' }}>
                      {cat.count}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recently Added ────────────────────────────────────────────── */}
          {analytics?.recentIDs?.length > 0 && (
            <div className="admin-section">
              <h2>🕐 Recently Added</h2>
              <div className="recent-ids-list glass-card">
                {analytics.recentIDs.map((id) => (
                  <Link to={`/id/${id._id}`} key={id._id} className="recent-id-row">
                    {/* Image */}
                    <div className="recent-id-img">
                      {id.images?.[0]
                        ? <img src={id.images[0].url} alt={id.title} />
                        : <span>🎮</span>
                      }
                    </div>

                    {/* Info */}
                    <div className="recent-id-info">
                      <strong>{id.title}</strong>
                      <span>UID: {id.uid} &nbsp;|&nbsp; Lv.{id.level} &nbsp;|&nbsp; {id.rank}</span>
                    </div>

                    {/* Category */}
                    <div className="recent-id-cat"
                      style={{ color: CATEGORY_COLORS[id.category] || '#fff' }}>
                      {id.category}
                    </div>

                    {/* Price */}
                    <div className="recent-id-price">
                      ₹{id.price?.toLocaleString('en-IN')}
                    </div>

                    {/* Status */}
                    <span className={id.status === 'sold' ? 'badge-sold' : 'badge-available'}>
                      {id.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
