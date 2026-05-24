import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { idsAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiPlus, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import './Admin.css';

const RANKS    = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Grandmaster'];
const STATUSES = ['available', 'sold'];

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ id, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:  id.title  || '',
    price:  id.price  || '',
    rank:   id.rank   || 'Bronze',
    status: id.status || 'available'
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminAPI.updateID(id._id, {
        title:  form.title,
        price:  Number(form.price),
        rank:   form.rank,
        status: form.status
      });
      toast.success('ID updated successfully! ✅');
      onSave(res.data.id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal__header">
          <h3>✏️ Edit ID</h3>
          <button className="edit-modal__close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal__form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={form.title}
              onChange={handleChange} required placeholder="ID title" />
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input type="number" name="price" value={form.price}
              onChange={handleChange} required min="0" placeholder="Price in INR" />
          </div>
          <div className="form-group">
            <label>Rank</label>
            <select name="rank" value={form.rank} onChange={handleChange}>
              {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="edit-modal__actions">
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminManageIDs = () => {
  const navigate = useNavigate();
  const [ids, setIds]         = useState([]);
  const [loading, setLoading]  = useState(true);
  const [page, setPage]        = useState(1);
  const [pages, setPages]      = useState(1);
  const [search, setSearch]    = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchIDs = async () => {
    setLoading(true);
    try {
      const res = await idsAPI.getAll({ page, limit: 20, search });
      setIds(res.data.ids);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIDs(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ID? This cannot be undone.')) return;
    try {
      await adminAPI.deleteID(id);
      setIds(ids.filter((i) => i._id !== id));
      toast.success('ID deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleMarkSold = async (id) => {
    try {
      const res = await adminAPI.markSold(id);
      setIds(ids.map((i) => i._id === id ? res.data.id : i));
      toast.success('Marked as sold');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleMarkAvailable = async (id) => {
    try {
      const res = await adminAPI.markAvailable(id);
      setIds(ids.map((i) => i._id === id ? res.data.id : i));
      toast.success('Marked as available');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleEditSave = (updatedId) => {
    setIds(ids.map((i) => i._id === updatedId._id ? updatedId : i));
  };

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <div className="admin-header">
          <div>
            <button className="back-btn" onClick={() => navigate('/admin')} style={{ marginBottom: '10px' }}>
              <FiArrowLeft /> Dashboard
            </button>
            <h1>📋 Manage IDs</h1>
            <p>Edit, delete, and manage all listed IDs</p>
          </div>
          <Link to="/admin/add-id" className="btn-primary">
            <FiPlus /> Add New ID
          </Link>
        </div>

        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search by title or UID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="admin-search"
          />
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="admin-table glass-card">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>UID</th>
                  <th>Price</th>
                  <th>Level</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ids.map((id) => (
                  <tr key={id._id}>
                    <td>
                      <div className="table-img">
                        {id.images?.[0]
                          ? <img src={id.images[0].url} alt={id.title} onError={(e) => { e.currentTarget.style.display='none'; }} />
                          : <span>🎮</span>
                        }
                      </div>
                    </td>
                    <td><strong>{id.title}</strong></td>
                    <td className="mono">{id.uid}</td>
                    <td>₹{id.price?.toLocaleString('en-IN')}</td>
                    <td>{id.level}</td>
                    <td>{id.category}</td>
                    <td>
                      <span className={id.status === 'sold' ? 'badge-sold' : 'badge-available'}>
                        {id.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => setEditingId(id)} title="Edit">
                          <FiEdit2 />
                        </button>
                        {id.status === 'available' ? (
                          <button className="action-btn sold" onClick={() => handleMarkSold(id._id)} title="Mark Sold">
                            <FiXCircle />
                          </button>
                        ) : (
                          <button className="action-btn available" onClick={() => handleMarkAvailable(id._id)} title="Mark Available">
                            <FiCheckCircle />
                          </button>
                        )}
                        <button className="action-btn delete" onClick={() => handleDelete(id._id)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {ids.length === 0 && (
              <div className="empty-state" style={{ padding: '40px' }}>
                <span>📭</span>
                <h3>No IDs found</h3>
              </div>
            )}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <EditModal
          id={editingId}
          onClose={() => setEditingId(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default AdminManageIDs;
