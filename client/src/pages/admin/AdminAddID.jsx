import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import './Admin.css';

const RANKS      = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Grandmaster'];
const CATEGORIES = ['Basic ID', 'Normal ID', 'Best ID', 'Super ID', 'Extreme ID'];

const AdminAddID = () => {
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

// Fix 1: renamed vault → voucher to match server model
  const [form, setForm] = useState({
    idName:      '',
    title:       '',
    uid:         '',
    level:       '',
    price:       '',
    rank:        'Bronze',
    category:    'Basic ID',
    description: '',
    contact:         '',
    contact2:        '',
    instagramLink:   '',
    whatsappChannel: '',
    voucher:     '',
    evoGuns:     '',
    evoMax:      '',
    allGunSkins: '',
    rareItems:   '',
    featured:    false,
    trending:    false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = { ...form, [name]: type === 'checkbox' ? checked : value };

    // Auto-update category when price changes
    if (name === 'price' && value) {
      const p = Number(value);
      if (p < 5000)       updated.category = 'Basic ID';
      else if (p < 10000) updated.category = 'Normal ID';
      else if (p < 15000) updated.category = 'Best ID';
      else if (p < 20000) updated.category = 'Super ID';
      else                updated.category = 'Extreme ID';
    }

    setForm(updated);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const res = await adminAPI.uploadImages(formData);
      setUploadedImages([...uploadedImages, ...res.data.images]);
      toast.success(`${files.length} file(s) uploaded!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.idName || !form.uid || !form.level || !form.price || !form.contact) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await adminAPI.addID({ ...form, images: uploadedImages });
      toast.success('ID added successfully! 🔥');
      navigate('/admin/manage-ids');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <div className="admin-header">
          <div>
            <button className="back-btn" onClick={() => navigate('/admin')} style={{ marginBottom: '10px' }}>
              <FiArrowLeft /> Dashboard
            </button>
            <h1>➕ Add New ID</h1>
            <p>List a new Free Fire account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-form glass-card">

          {/* ── Section: Basic Info ─────────────────────────────────────── */}
          <div className="form-section-title">📋 Basic Information</div>
          <div className="form-grid">
            <div className="form-group">
              <label>ID Name *</label>
              <input name="idName" value={form.idName} onChange={handleChange}
                placeholder="e.g. Ayan FF, Shadow King" required />
            </div>
            <div className="form-group">
              <label>ID Title *</label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Pro Grandmaster Account" required />
            </div>
            <div className="form-group">
              <label>UID *</label>
              <input name="uid" value={form.uid} onChange={handleChange}
                placeholder="Free Fire UID" required />
            </div>
            <div className="form-group">
              <label>Level *</label>
              <input name="level" type="number" value={form.level} onChange={handleChange}
                placeholder="1-100" min="1" max="100" required />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange}
                placeholder="e.g. 5000" min="0" required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                💡 Auto-set by price
              </small>
            </div>
            <div className="form-group">
              <label>Rank</label>
              <select name="rank" value={form.rank} onChange={handleChange}>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* ── Section: Account Details ────────────────────────────────── */}
          <div className="form-section-title">🎮 Account Details <span className="optional-tag">optional</span></div>
          <div className="form-grid">
            <div className="form-group">
              <label>💎 Vault Collection</label>
              <input name="voucher" type="number" value={form.voucher} onChange={handleChange}
                placeholder="e.g. 2000" min="0" />
            </div>
            <div className="form-group">
              <label>🔫 Evo Guns</label>
              <input name="evoGuns" type="number" value={form.evoGuns} onChange={handleChange}
                placeholder="Number of Evo Guns" min="0" />
            </div>
            <div className="form-group">
              <label>⚡ Evo Max Skins</label>
              <input name="evoMax" type="number" value={form.evoMax} onChange={handleChange}
                placeholder="Number of Evo Max skins" min="0" />
            </div>
            <div className="form-group">
              <label>🎯 Total Weapon Skins</label>
              <input name="allGunSkins" type="number" value={form.allGunSkins} onChange={handleChange}
                placeholder="Total weapon skins count" min="0" />
            </div>
            <div className="form-group">
              <label>✨ Rare Items</label>
              <input name="rareItems" value={form.rareItems} onChange={handleChange}
                placeholder="e.g. Paloma Bundle, Cobra Bundle" />
            </div>
          </div>

          {/* ── Section: Contact ────────────────────────────────────────── */}
          <div className="form-section-title">📞 Contact Info</div>
          <div className="form-grid">
            <div className="form-group">
              <label>WhatsApp Number 1 *</label>
              <input name="contact" value={form.contact} onChange={handleChange}
                placeholder="e.g. 919876543210 (with country code)" required />
            </div>
            <div className="form-group">
              <label>WhatsApp Number 2 <span className="optional-tag">optional</span></label>
              <input name="contact2" value={form.contact2} onChange={handleChange}
                placeholder="e.g. 919876543211 (with country code)" />
            </div>
            <div className="form-group">
              <label>Instagram Link <span className="optional-tag">optional</span></label>
              <input name="instagramLink" value={form.instagramLink} onChange={handleChange}
                placeholder="https://instagram.com/yourprofile" />
            </div>
            <div className="form-group">
              <label>WhatsApp Channel Link <span className="optional-tag">optional</span></label>
              <input name="whatsappChannel" value={form.whatsappChannel} onChange={handleChange}
                placeholder="https://whatsapp.com/channel/..." />
            </div>
            <div className="form-group full-width">
              <label>Description <span className="optional-tag">optional</span></label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the account — bundles, emotes, special items..." rows={4} />
            </div>
          </div>

          {/* ── Checkboxes ──────────────────────────────────────────────── */}
          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              ⭐ Mark as Featured
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="trending" checked={form.trending} onChange={handleChange} />
              🔥 Mark as Trending
            </label>
          </div>

          {/* ── Image + Video Upload ─────────────────────────────────────── */}
          <div className="form-section-title">📸 Screenshots & Videos <span className="optional-tag">optional</span></div>
          <div className="form-group">
            <div className="upload-area">
              <input type="file" accept="image/*,video/*" multiple
                onChange={handleImageUpload} id="img-upload" style={{ display: 'none' }} />
              <label htmlFor="img-upload" className="upload-btn">
                <FiUpload />
                {uploadLoading ? 'Uploading...' : 'Upload Images & Videos (max 10)'}
              </label>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
                📸 Images: JPG, PNG &nbsp;|&nbsp; 🎥 Videos: MP4, MOV (max 50MB)
              </p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="uploaded-images">
                {uploadedImages.map((file, i) => (
                  <div key={i} className="uploaded-img">
                    {file.type === 'video' ? (
                      <video src={file.url} muted playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={file.url} alt={`Upload ${i + 1}`} />
                    )}
                    <span className="media-type-badge">{file.type === 'video' ? '🎥' : '📸'}</span>
                    <button type="button" onClick={() => removeImage(i)}><FiX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/admin')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : '➕ Add ID'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminAddID;
