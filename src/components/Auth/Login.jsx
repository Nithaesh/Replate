import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  // Destructure tools from AuthContext
  const { loginWithEmail, loginWithGoogle, dbUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (dbUser) {
      if (dbUser.role === 'donor') navigate('/dashboard/donor');
      else if (dbUser.role === 'institutional_receiver') navigate('/dashboard/ngo');
    }
  }, [dbUser, navigate]);

  // Handle Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!loginWithEmail) {
        throw new Error("Auth functions not loaded. Refresh page.");
      }
      await loginWithEmail(formData.email, formData.password);
      // Redirect handled by useEffect above
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Google Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* HEADER */}
        <div className="auth-header">
           <div className="logo-text" onClick={() => navigate('/')}>RePlate<span className="dot">.</span></div>
        </div>

        <div className="fade-in">
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Login to your account
          </p>

          {/* EMAIL FORM */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input 
                  type="email" 
                  className="styled-input" 
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  className="styled-input" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {error && <p className="text-red" style={{textAlign:'center', fontSize:'0.9rem', marginBottom: '1rem'}}>{error}</p>}

            <button className="auth-btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* SEPARATOR */}
          <div className="section-divider" style={{margin: '1.5rem 0', height: '1px', background: 'rgba(255,255,255,0.1)'}}></div>

          {/* GOOGLE BUTTON */}
          <button className="auth-btn btn-ghost" onClick={handleGoogle} disabled={loading}>
            <FaGoogle /> Login with Google
          </button>

          {/* FOOTER LINKS */}
          <p className="auth-footer" style={{marginTop: '1.5rem'}}>
            Don't have an account? <span className="link-text" onClick={() => navigate('/register')}>Sign Up</span>
          </p>
          
          <p className="auth-footer" style={{marginTop: '0.5rem'}}>
             <span className="link-text" style={{color: '#a3a3a3', fontSize:'0.9rem'}} onClick={() => navigate('/')}>
               <FaArrowLeft style={{marginRight:'5px'}}/> Back to Home
             </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;