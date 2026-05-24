import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUsers, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import './Admin.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // track which user is being deleted
  const { user: currentUser } = useAuth();

  useEffect(() => {
    adminAPI.getUsers()
      .then((res) => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (userId, userName) => {
    // Prevent deleting yourself
    if (userId === currentUser?._id) {
      toast.error("You can't delete your own account!");
      return;
    }

    if (!window.confirm(`Delete user "${userName}"? This will permanently remove them from the database.`)) return;

    setDeleting(userId);
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success(`User "${userName}" deleted successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <div className="admin-header">
          <div>
            <button className="back-btn" onClick={() => navigate('/admin')} style={{ marginBottom: '10px' }}>
              <FiArrowLeft /> Dashboard
            </button>
            <h1><FiUsers /> Users ({users.length})</h1>
            <p>All registered users</p>
          </div>
        </div>

        <div className="admin-table glass-card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user._id}>
                  <td>{i + 1}</td>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.mobile ? `+91 ${user.mobile}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>
                    <span className={user.isVerified ? 'badge-available' : 'badge-sold'}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(user._id, user.name)}
                      disabled={deleting === user._id}
                      title="Delete User"
                      style={{ opacity: deleting === user._id ? 0.5 : 1 }}
                    >
                      {deleting === user._id
                        ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        : <FiTrash2 />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="empty-state" style={{ padding: '40px' }}>
              <span>👥</span>
              <h3>No users yet</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
