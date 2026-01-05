import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaUtensils } from 'react-icons/fa';
import './Auth.css';

const AuthSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      {/* HEADER */}
      <div style={{ position: 'absolute', top: '40px', left: '0', right: '0', textAlign: 'center' }}>
          <div className="logo-text" style={{fontSize: '2rem'}} onClick={() => navigate('/')}>RePlate<span className="dot">.</span></div>
      </div>

      <div className="fade-in" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 10, marginTop: '60px' }}>
        
        {/* CARD 1: DONOR */}
        <div className="auth-card hover-card" style={{ width: '320px', textAlign: 'center', cursor: 'pointer' }}
             onClick={() => navigate('/auth/donor')}>
          <div style={{ fontSize: '3rem', color: '#00e599', marginBottom: '1.5rem' }}>
            <FaUtensils />
          </div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>I have Food</h2>
          <p style={{ color: '#a3a3a3', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            For restaurants, caterers, and individuals looking to donate.
          </p>
          <button className="auth-btn btn-primary">
            Donate Now
          </button>
        </div>

        {/* CARD 2: RECEIVER */}
        <div className="auth-card hover-card" style={{ width: '320px', textAlign: 'center', cursor: 'pointer' }}
             onClick={() => navigate('/auth/receiver')}>
          <div style={{ fontSize: '3rem', color: '#00e599', marginBottom: '1.5rem' }}>
            <FaHandHoldingHeart />
          </div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>I need Food</h2>
          <p style={{ color: '#a3a3a3', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            For NGOs, shelters, and communities in need of support.
          </p>
          <button className="auth-btn btn-ghost">
            Request Food
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthSelection;