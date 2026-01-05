import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelopeOpenText, FaRedo, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

const VerifyEmail = () => {
  const { user, dbUser, resendVerification, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);

  // Auto-redirect if verified
  useEffect(() => {
    const checkStatus = async () => {
      if (user?.emailVerified) {
        // If NGO, check if Admin approved them
        if (dbUser?.role === 'institutional_receiver' && dbUser?.status === 'pending') {
           navigate('/dashboard/ngo'); // This dashboard will show "Pending Approval" state
        } else {
           // Normal redirect
           const path = dbUser?.role === 'donor' ? '/dashboard/donor' : '/dashboard/ngo';
           navigate(path);
        }
      }
    };
    checkStatus();
  }, [user, dbUser, navigate]);

  const handleResend = async () => {
    try {
      await resendVerification();
      setMessage('Verification email sent! Check your inbox (and spam).');
    } catch (err) {
      setMessage('Error sending email. Try again later.');
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);
    await user.reload(); // Refresh Firebase Auth Token
    if (user.emailVerified) {
        window.location.reload(); // Force full reload to update context
    } else {
        setMessage('Not verified yet. Please click the link in your email.');
    }
    setChecking(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div className="auth-header">
           <div className="logo-text">RePlate<span className="dot">.</span></div>
        </div>

        <div className="fade-in">
            <FaEnvelopeOpenText style={{fontSize: '4rem', color: '#00e599', marginBottom: '1.5rem'}} />
            
            <h2 style={{ marginBottom: '0.5rem' }}>Verify your Email</h2>
            <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
              We've sent a link to <br/>
              <span style={{color: 'white', fontWeight: 600}}>{user?.email}</span>
            </p>

            {message && <p className="text-red" style={{marginBottom: '1rem', color: '#f43f5e'}}>{message}</p>}

            <button className="auth-btn btn-primary" onClick={handleManualCheck} disabled={checking}>
              {checking ? 'Checking...' : 'I have verified my email'}
            </button>

            <button className="auth-btn btn-ghost" onClick={handleResend} style={{marginTop: '1rem'}}>
               <FaRedo /> Resend Email
            </button>
            
            <p className="auth-footer" style={{marginTop: '2rem'}}>
                <span className="link-text" onClick={logout} style={{color: '#a3a3a3'}}>
                    <FaArrowLeft /> Log Out
                </span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;