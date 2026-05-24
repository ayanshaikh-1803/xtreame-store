import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
    <div>
      <h1 style={{ fontFamily: 'var(--font-gaming)', fontSize: '8rem', color: 'var(--primary)', textShadow: '0 0 40px var(--primary-glow)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.5rem', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  </div>
);

export default NotFound;
