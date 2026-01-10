import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaHandHoldingHeart, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

const AuthSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div style={{maxWidth:'900px', width:'100%', zIndex: 10}}>
        
        <div style={{textAlign:'center', marginBottom:'3rem'}}>
          <h1 style={{fontSize:'3rem', fontWeight:'800', color:'white', marginBottom:'0.5rem'}}>
            RePlate<span className="highlight">.</span>
          </h1>
          <p className="auth-subtitle" style={{fontSize:'1.1rem'}}>Choose how you want to make an impact today.</p>
        </div>

        <div className="selection-grid">
          {/* DONOR OPTION */}
          <div className="selection-card" onClick={() => navigate('/login')}>
            <FaUtensils className="selection-icon" />
            <h2 style={{color:'white', marginBottom:'0.5rem'}}>I have Food</h2>
            <p style={{color:'#888', lineHeight:'1.5'}}>
              Restaurants, caterers, and individuals.<br/>Donate surplus food instantly.
            </p>
          </div>

          {/* NGO OPTION */}
          <div className="selection-card" onClick={() => navigate('/auth/receiver')}>
            <FaHandHoldingHeart className="selection-icon" />
            <h2 style={{color:'white', marginBottom:'0.5rem'}}>I need Food</h2>
            <p style={{color:'#888', lineHeight:'1.5'}}>
              NGOs, Shelters, and Communities.<br/>Connect with local donors.
            </p>
          </div>
        </div>

        <div style={{textAlign:'center', marginTop:'3rem'}}>
          <span className="link-text" onClick={() => navigate('/')} style={{display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'1rem'}}>
            <FaArrowLeft /> Back to Home
          </span>
        </div>

      </div>
    </div>
  );
};
export default AuthSelection;