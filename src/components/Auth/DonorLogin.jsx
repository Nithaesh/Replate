import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock, FaPhoneAlt, FaArrowLeft } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../../firebase'; // Needed to check if user exists
import './Auth.css';

const DonorLogin = () => {
  const { signupWithEmail, registerUserInDB, loginWithGoogle, dbUser, user } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  // 1. AUTO-REDIRECT: If database says they are a Donor, go to Dashboard
  useEffect(() => {
    if (dbUser && dbUser.role === 'donor') {
      navigate('/dashboard/donor');
    }
  }, [dbUser, navigate]);

  // 2. GOOGLE LOGIN (THE FIX)
// FIND YOUR HANDLE GOOGLE LOGIN FUNCTION AND REPLACE IT:
  const handleGoogleClick = async () => {
    try {
      console.log("UI Step 1: Button Clicked"); // DEBUG LOG
      const user = await loginWithGoogle();
      
      console.log("UI Step 2: Data Received from Context:", user); // DEBUG LOG

      if (!user) {
        console.error("CRITICAL ERROR: User is undefined!");
        alert("Login System Error: No user data received. Check Console.");
        return;
      }

      // Safe Check
      if (user.uid) {
         console.log("UI Step 3: Redirecting...");
         // Your redirect logic here...
         navigate('/dashboard/donor'); 
      }
    } catch (error) {
      console.error("UI Error:", error);
    }
  };

  // 3. EMAIL SIGNUP
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await signupWithEmail(formData.email, formData.password);
      await registerUserInDB(userCred.user.uid, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone
      }, 'donor');
      // Redirect handled by useEffect
    } catch (err) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* Header */}
        <div className="auth-header">
           <div className="logo-text" onClick={() => navigate('/')}>RePlate<span className="dot">.</span></div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          {isRegistering ? 'Donor Registration' : 'Donate Food'}
        </h2>
        
        {/* LOGIN / SIGNUP TOGGLE */}
        {!isRegistering ? (
          /* LOGIN VIEW */
          <div className="fade-in">
             <button className="auth-btn btn-ghost" onClick={handleGoogleClick} disabled={loading}>
               {loading ? 'Connecting...' : <><FaGoogle /> Continue with Google</>}
             </button>

             <div className="section-divider" style={{margin: '1.5rem 0', height:'1px', background:'rgba(255,255,255,0.1)'}}></div>
             
             <button className="auth-btn btn-primary" onClick={() => setIsRegistering(true)}>
               Create Account with Email
             </button>
             
             <p className="auth-footer" style={{marginTop:'1rem'}}>
               Already have an account? <span className="link-text" onClick={() => navigate('/login')}>Login here</span>
             </p>
             <p className="auth-footer" style={{marginTop:'0.5rem'}}>
                <span className="link-text" onClick={() => navigate('/')} style={{color:'#a3a3a3'}}>
                  <FaArrowLeft style={{marginRight:'5px'}}/> Back to Home
                </span>
             </p>
          </div>
        ) : (
          /* REGISTER FORM VIEW */
          <form onSubmit={handleEmailSignup} className="fade-in">
            <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="styled-input" required 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input type="email" className="styled-input" required 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
            </div>
            <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input type="password" className="styled-input" required 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
            </div>
            <div className="form-group">
                <label>Phone</label>
                <div className="input-wrapper">
                  <FaPhoneAlt className="input-icon" />
                  <input type="tel" className="styled-input" required 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
            </div>
            
            <button className="auth-btn btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            
            <p className="auth-footer" style={{marginTop:'1rem'}}>
               <span className="link-text" onClick={() => setIsRegistering(false)}>
                 <FaArrowLeft style={{marginRight:'5px'}}/> Back to Options
               </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default DonorLogin;