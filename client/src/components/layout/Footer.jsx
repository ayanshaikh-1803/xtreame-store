import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <div className="footer__brand">
        <div className="footer__logo">
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
        </div>
        <p>Premium Free Fire IDs marketplace. Verified accounts, best prices, instant contact.</p>
        <div className="footer__social">
          <a href="https://wa.me/YOUR_NUMBER" target="_blank" rel="noreferrer" title="WhatsApp">
            <FaWhatsapp />
          </a>
          <a href="https://t.me/YOUR_USERNAME" target="_blank" rel="noreferrer" title="Telegram">
            <FaTelegram />
          </a>
          <a href="https://instagram.com/YOUR_HANDLE" target="_blank" rel="noreferrer" title="Instagram">
            <FiInstagram />
          </a>
        </div>
      </div>

      <div className="footer__links">
        <h4>Quick Links</h4>
        <Link to="/">Home</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/register">Sign Up</Link>
        <Link to="/login">Login</Link>
      </div>

      <div className="footer__links">
        <h4>Categories</h4>
        <Link to="/marketplace?category=Basic ID">Basic ID</Link>
        <Link to="/marketplace?category=Normal ID">Normal ID</Link>
        <Link to="/marketplace?category=Best ID">Best ID</Link>
        <Link to="/marketplace?category=Super ID">Super ID</Link>
        <Link to="/marketplace?category=Extreme ID">Extreme ID</Link>
      </div>
    </div>

    <div className="footer__bottom">
      <p>© 2024 XTREAME STORE. All rights reserved. | Built with 🔥</p>
    </div>
  </footer>
);

export default Footer;
