import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelopeOpenText, FaRedo } from 'react-icons/fa';
import './Auth.css';

const VerifyEmail = () => {
  const { user, sendVerification, logout } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    try { await sendVerification(); alert("Verification link resent!"); } 
    catch (e) { alert(e.message); }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <div style={{background:'rgba(255,255,255,0.05)', width:'70px', height:'70px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem auto'}}>
          <FaEnvelopeOpenText size={30} color="#00e599"/>
        </div>
        <h2 className="auth-title">Verify Email</h2>
        <p className="auth-subtitle">
          We sent a link to <strong>{user?.email}</strong>.<br/>
          Please check your inbox and click the link.
        </p>

        <button className="btn-primary" onClick={() => window.location.reload()}>
          I Verified It (Refresh)
        </button>
        
        <button className="btn-secondary" style={{marginTop:'1rem'}} onClick={handleResend}>
          <FaRedo /> Resend Link
        </button>
        
        <div style={{marginTop:'2rem'}}>
           <span className="link-text" onClick={async() => { await logout(); navigate('/login'); }}>Logout</span>
        </div>
      </div>
    </div>
  );
};
export default VerifyEmail;