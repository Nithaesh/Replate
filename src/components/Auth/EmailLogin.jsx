import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../../firebase';
import './Auth.css';

const EmailLogin = () => {
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const cred = await loginWithEmail(formData.email, formData.password);
      const user = cred.user;

      if (!user.emailVerified) {
        navigate('/verify-email');
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const role = snap.data().role;
        if (role === 'individual_donor') navigate('/dashboard/donor');
        else if (role === 'institutional_receiver') navigate('/dashboard/ngo');
        else navigate('/admin');
      } else {
        setError("Account not found.");
      }
    } catch (err) { setError("Invalid email or password."); setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <div style={{textAlign:'left', marginBottom:'1rem'}}>
          <button onClick={() => navigate('/login')} style={{background:'none', border:'none', color:'#888', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Enter your email and password.</p>

        {error && <div className="error-banner"><FaExclamationCircle/> {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input type="email" className="glass-input" placeholder="Email Address" required 
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input type="password" className="glass-input" placeholder="Password" required 
              onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div style={{textAlign:'right', marginBottom:'1.5rem'}}>
            <span className="link-text" onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EmailLogin;