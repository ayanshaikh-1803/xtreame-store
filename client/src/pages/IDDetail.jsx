import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { idsAPI, cartAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiArrowLeft, FiEye } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import './IDDetail.css';

const IDDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    idsAPI.getById(id)
      .then((res) => setGameId(res.data.id))
      .catch(() => navigate('/marketplace'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast('Please login to continue', { icon: '🔐' });
      navigate('/login', { state: { from: `/id/${gameId._id}` } });
      return;
    }
    if (gameId.status === 'sold') return;
    setCartLoading(true);
    try {
      await cartAPI.add(gameId._id);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      toast('Please login to continue', { icon: '🔐' });
      navigate('/login', { state: { from: `/id/${gameId._id}` } });
      return;
    }
    try {
      await wishlistAPI.toggle(gameId._id);
      toast.success('Wishlist updated!');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const whatsappMsg = encodeURIComponent(
    `🎮 Hi! I'm interested in this Free Fire ID:\n\n` +
    `📛 Name: ${gameId?.idName || gameId?.title}\n` +
    `🆔 UID: ${gameId?.uid}\n` +
    `⚡ Level: ${gameId?.level}\n` +
    `🏆 Rank: ${gameId?.rank}\n` +
    `💰 Price: ₹${gameId?.price?.toLocaleString('en-IN')}\n\n` +
    `Please confirm availability. Thank you!`
  );

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!gameId) return null;

  const isSold = gameId.status === 'sold';

  return (
    <div className="id-detail page-enter">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="id-detail__grid">
          {/* Images */}
          <div className="id-detail__images">
            <div className="main-image">
              {gameId.images?.[activeImg] ? (
                gameId.images[activeImg].type === 'video' ? (
                  <video
                    src={gameId.images[activeImg].url}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img src={gameId.images[activeImg].url} alt={gameId.title} />
                )
              ) : (
                <div className="img-placeholder">🎮</div>
              )}
              {isSold && <div className="sold-overlay"><span className="badge-sold">SOLD OUT</span></div>}
            </div>
            {gameId.images?.length > 1 && (
              <div className="image-thumbs">
                {gameId.images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    {img.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎥</div>
                    ) : (
                      <img src={img.url} alt={`Screenshot ${i + 1}`} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="id-detail__info">
            <div className="id-detail__category">{gameId.category}</div>
            <h1 className="id-detail__title">{gameId.title}</h1>

            <div className="id-detail__meta">
              <div className="meta-item">
                <span className="meta-label">UID</span>
                <span className="meta-value mono">{gameId.uid}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Level</span>
                <span className="meta-value">{gameId.level}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Rank</span>
                <span className="meta-value">{gameId.rank}</span>
              </div>
              {gameId.voucher > 0 && (
                <div className="meta-item">
                  <span className="meta-label">💎 Vault Collection</span>
                  <span className="meta-value">₹{gameId.voucher?.toLocaleString('en-IN')}</span>
                </div>
              )}
              {gameId.evoGuns > 0 && (
                <div className="meta-item">
                  <span className="meta-label">🔫 Evo Guns</span>
                  <span className="meta-value">{gameId.evoGuns}</span>
                </div>
              )}
              {gameId.evoMax > 0 && (
                <div className="meta-item">
                  <span className="meta-label">⚡ Evo Max</span>
                  <span className="meta-value">{gameId.evoMax}</span>
                </div>
              )}
              {gameId.allGunSkins > 0 && (
                <div className="meta-item">
                  <span className="meta-label">🎯 Total Weapon Skins</span>
                  <span className="meta-value">{gameId.allGunSkins}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Views</span>
                <span className="meta-value"><FiEye /> {gameId.views}</span>
              </div>
            </div>

            {/* Rare Items */}
            {gameId.rareItems && (
              <div className="id-detail__desc" style={{ marginBottom: '16px' }}>
                <h4>✨ Rare Items</h4>
                <p>{gameId.rareItems}</p>
              </div>
            )}

            <div className="id-detail__price">
              ₹{gameId.price?.toLocaleString('en-IN')}
            </div>

            {gameId.description && (
              <div className="id-detail__desc">
                <h4>Description</h4>
                <p>{gameId.description}</p>
              </div>
            )}

            {/* Status */}
            <div className="id-detail__status">
              {isSold ? (
                <span className="badge-sold">SOLD OUT</span>
              ) : (
                <span className="badge-available">AVAILABLE</span>
              )}
            </div>

            {/* Actions */}
            <div className="id-detail__actions">
              {!isSold && (
                <>
                  <button className="btn-primary" onClick={handleAddToCart} disabled={cartLoading}>
                    <FiShoppingCart /> {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button className="btn-outline" onClick={handleWishlist}>
                    <FiHeart /> Wishlist
                  </button>
                </>
              )}
            </div>

            {/* Contact */}
            <div className="id-detail__contact">
              <h4>Contact Developer</h4>

              {!isLoggedIn ? (
                /* Not logged in — show login prompt instead of contact buttons */
                <div className="contact-login-prompt">
                  <p>🔐 Contact details dekhne ke liye login karo</p>
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/login', { state: { from: `/id/${gameId._id}` } })}
                    style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
                  >
                    Login to Contact
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Don't have account? <Link to="/register" style={{ color: 'var(--primary)' }}>Sign Up Free</Link>
                  </p>
                </div>
              ) : (
                /* Logged in — show all contact buttons */
                <div className="contact-buttons">
                  <a
                    href={`https://wa.me/${gameId.contact}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-btn whatsapp"
                  >
                    <FaWhatsapp /> WhatsApp
                  </a>

                  {gameId.contact2 && (
                    <a
                      href={`https://wa.me/${gameId.contact2}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-btn whatsapp"
                    >
                      <FaWhatsapp /> WhatsApp 2
                    </a>
                  )}

                  {gameId.instagramLink && (
                    <a
                      href={gameId.instagramLink}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-btn instagram"
                    >
                      <FaInstagram /> Instagram
                    </a>
                  )}

                  {gameId.whatsappChannel && (
                    <a
                      href={gameId.whatsappChannel}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-btn whatsapp-channel"
                    >
                      <FaWhatsapp /> WA Channel
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDDetail;
