import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { idsAPI } from '../services/api';
import IDCard from '../components/IDCard';
import { FiArrowRight, FiZap, FiShield, FiStar } from 'react-icons/fi';
import './Home.css';

const CATEGORIES = [
  { name: 'Basic ID', range: '₹1K - ₹5K', color: '#888', emoji: '🎮' },
  { name: 'Normal ID', range: '₹5K - ₹10K', color: '#4488ff', emoji: '⚔️' },
  { name: 'Best ID', range: '₹10K - ₹15K', color: '#00cc66', emoji: '🏆' },
  { name: 'Super ID', range: '₹15K - ₹20K', color: '#ff8800', emoji: '💎' },
  { name: 'Extreme ID', range: '₹20K+', color: '#ff0033', emoji: '⚡' }
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, trendRes] = await Promise.all([
          idsAPI.getFeatured(),
          idsAPI.getTrending()
        ]);
        setFeatured(featRes.data.ids);
        setTrending(trendRes.data.ids);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home page-enter">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">

        {/* LEFT SIDE */}
        <div className="hero-left">
          <div className="hero__badge">🔥 #1 Free Fire ID Marketplace</div>

          <h1 className="hero-title">
            <span className="hero__title-x">X</span><span className="hero__title-treame">TREAME</span>
            <br />
            <span className="hero__title-store">STORE</span>
          </h1>

          <p className="hero-desc">
            Buy premium Free Fire IDs with verified accounts,
            rare skins and top ranks. Instant contact, best prices guaranteed.
          </p>

          <div className="hero-buttons">
            <Link to="/marketplace" className="btn-primary">
              Browse IDs <FiArrowRight />
            </Link>
            <Link to="/register" className="btn-outline">
              Join Free
            </Link>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <strong>500+</strong>
              <span>IDs Listed</span>
            </div>
            <div className="hero__stat">
              <strong>1000+</strong>
              <span>Happy Buyers</span>
            </div>
            <div className="hero__stat">
              <strong>100%</strong>
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hero-right">
          <div className="xtreame-logo-box">
            <img src="/xtreame-logo.png" alt="XTREAME" />
          </div>
        </div>

      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="features">
        <div className="container">
          <div className="features__grid">
            <div className="feature-card glass-card">
              <FiZap className="feature-icon" />
              <h3>Instant Contact</h3>
              <p>Direct WhatsApp & Telegram links for every ID. No delays.</p>
            </div>
            <div className="feature-card glass-card">
              <FiShield className="feature-icon" />
              <h3>Verified IDs</h3>
              <p>Every account is manually verified before listing.</p>
            </div>
            <div className="feature-card glass-card">
              <FiStar className="feature-icon" />
              <h3>Best Prices</h3>
              <p>Competitive pricing across all categories. No hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="category-card glass-card"
                style={{ '--cat-color': cat.color }}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <h3>{cat.name}</h3>
                <span className="category-range">{cat.range}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trending IDs ─────────────────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="ids-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">🔥 Trending IDs</h2>
              <Link to="/marketplace" className="see-all">See All <FiArrowRight /></Link>
            </div>
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : (
              <div className="ids-grid">
                {trending.map((id) => <IDCard key={id._id} id={id} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Featured IDs ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="ids-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">⭐ Featured IDs</h2>
              <Link to="/marketplace" className="see-all">See All <FiArrowRight /></Link>
            </div>
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : (
              <div className="ids-grid">
                {featured.map((id) => <IDCard key={id._id} id={id} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card neon-border">
            <h2>Ready to find your dream Free Fire ID?</h2>
            <p>Join thousands of gamers who trust XTREAME STORE.</p>
            <Link to="/marketplace" className="btn-primary">
              Explore Marketplace <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
