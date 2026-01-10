import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { db } from '../../firebase';
import './Auth.css';

const Login = () => {
  const { loginWithGoogle, user, dbUser, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. PERSISTENCE & GATEKEEPING
  useEffect(() => {
    if (user && dbUser) {
      // RULE 1: Email Verification (Skip for Google Login as it's auto-verified)
      if (!user.emailVerified && user.providerData[0].providerId === 'password') {
        setError("Email not verified. Please check your inbox.");
        logout(); // Kick them out if not verified
        return;
      }

      // RULE 2: Admin Approval (For NGOs)
      if (dbUser.role === 'institutional_receiver' && dbUser.status !== 'active') {
        setError(dbUser.status === 'suspended' ? "Your account has been suspended by Admin." : "Account pending Admin approval.");
        logout(); // Kick them out if not active
        return;
      }

      // If all checks pass -> Redirect
      if (dbUser.role === 'individual_donor') navigate('/dashboard/donor');
      else if (dbUser.role === 'institutional_receiver') navigate('/dashboard/ngo');
      else if (dbUser.role === 'admin') navigate('/admin');
    }
  }, [user, dbUser, navigate, logout]);

  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      const result = await loginWithGoogle();
      const googleUser = result.user;
      
      const userRef = doc(db, "users", googleUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          name: googleUser.displayName || "User",
          email: googleUser.email,
          role: 'individual_donor', 
          createdAt: serverTimestamp(),
          status: 'active',
          donorDetails: { totalDonations: 0, totalMealsDonated: 0, donorBadge: 'Bronze' }
        });
      }
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to RePlate</p>
        
        {/* CUSTOM ERROR MESSAGE DISPLAY */}
        {error && <div className="error-banner" style={{borderLeft:'4px solid #ff4444'}}><FaExclamationCircle/> {error}</div>}
        
        <button className="btn-primary" onClick={handleGoogleLogin} disabled={loading}>
          {loading ? 'Logging in...' : <><FaGoogle /> Continue with Google</>}
        </button>
        
        <div className="divider"><span>OR</span></div>
        <button className="btn-secondary" onClick={() => navigate('/login-email')}>
          <FaEnvelope /> Sign in with Email
        </button>
        
        <p style={{marginTop:'2rem', color:'#666', fontSize:'0.9rem'}}>
          New here? <span className="link-text" onClick={() => navigate('/register')}>Create Account</span>
        </p>
      </div>
    </div>
  );
};
export default Login;