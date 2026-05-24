import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cartAPI.get()
      .then((res) => setCart(res.data.cart))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (idId) => {
    try {
      await cartAPI.remove(idId);
      setCart(cart.filter((item) => item.id?._id !== idId));
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleClear = async () => {
    try {
      await cartAPI.clear();
      setCart([]);
      toast.success('Cart cleared');
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <div className="page-header">
          <div>
            <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>
              <FiArrowLeft /> Back
            </button>
            <h1><FiShoppingCart /> My Cart</h1>
          </div>
          {cart.length > 0 && (
            <button className="btn-outline" onClick={handleClear} style={{ padding: '8px 16px', fontSize: '13px' }}>
              Clear All
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <span>🛒</span>
            <h3>Your cart is empty</h3>
            <p>Browse the marketplace and add IDs you like</p>
            <Link to="/marketplace" className="btn-primary" style={{ marginTop: '20px' }}>Browse IDs</Link>
          </div>
        ) : (
          <div className="cart-list">
            {cart.map((item) => {
              const id = item.id;
              if (!id) return null;
              return (
                <div key={item._id} className={`cart-item glass-card${id.status === 'sold' ? ' cart-item--sold' : ''}`}>
                  <Link to={`/id/${id._id}`} className="cart-item__image">
                    {id.images?.[0] ? (
                      <img src={id.images[0].url} alt={id.title} />
                    ) : (
                      <div className="cart-img-placeholder">🎮</div>
                    )}
                  </Link>
                  <div className="cart-item__info">
                    <Link to={`/id/${id._id}`}>
                      <h3>{id.title}</h3>
                    </Link>
                    <p>UID: {id.uid} | Level: {id.level} | {id.rank}</p>
                    <span className={id.status === 'sold' ? 'badge-sold' : 'badge-available'}>
                      {id.status === 'sold' ? 'SOLD' : 'AVAILABLE'}
                    </span>
                    {id.status === 'sold' && (
                      <p className="cart-item__sold-note">⚠️ This ID has been sold</p>
                    )}
                  </div>
                  <div className="cart-item__price">
                    ₹{id.price?.toLocaleString('en-IN')}
                  </div>
                  <div className="cart-item__actions">
                    {id.status !== 'sold' ? (
                      <a
                        href={`https://wa.me/${id.contact}?text=${encodeURIComponent(`Hi, I'm interested in: ${id.title} (UID: ${id.uid})`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-btn whatsapp"
                        style={{ padding: '8px 14px', fontSize: '12px' }}
                      >
                        <FaWhatsapp /> Buy
                      </a>
                    ) : (
                      <button
                        className="contact-btn whatsapp"
                        disabled
                        style={{ padding: '8px 14px', fontSize: '12px', opacity: 0.4, cursor: 'not-allowed' }}
                      >
                        <FaWhatsapp /> Buy
                      </button>
                    )}
                    <button className="remove-btn" onClick={() => handleRemove(id._id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
