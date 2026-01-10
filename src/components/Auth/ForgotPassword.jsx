import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './Auth.css'; // Reusing your main theme

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [msg, setMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await resetPassword(email);
      setStatus('success');
      setMsg(`Reset link sent to ${email}`);
    } catch (err) {
      setStatus('error');
      setMsg(err.message.includes('not-found') ? 'Email not registered.' : err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <button onClick={() => navigate('/login-email')} style={{background:'none', border:'none', color:'#888', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', marginBottom:'1rem'}}>
          <FaArrowLeft /> Back
        </button>

        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Don't worry, it happens. We'll send you a link to reset it.</p>

        {status === 'success' ? (
          <div style={{textAlign:'center', animation:'slideUpFade 0.5s ease'}}>
            <FaCheckCircle size={50} color="#00e599" style={{marginBottom:'1rem'}}/>
            <h3 style={{color:'white', marginBottom:'10px'}}>Check your Inbox</h3>
            <p style={{color:'#888', fontSize:'0.9rem'}}>{msg}</p>
            <button className="btn-secondary" style={{marginTop:'2rem'}} onClick={() => navigate('/login-email')}>Return to Login</button>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            {status === 'error' && <div className="error-banner"><FaExclamationCircle/> {msg}</div>}
            
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input type="email" className="glass-input" placeholder="Enter your email" required 
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <button className="btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;