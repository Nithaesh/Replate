import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { sendEmailVerification } from 'firebase/auth'; // Import this
import { db } from '../../firebase';
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './Auth.css'; 

const NGORegister = () => {
  const { signupWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [location, setLocation] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // Success State

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoading(false);
        },
        (err) => { setError("Location access denied. Please enable GPS."); setLoading(false); }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    if (!location) {
      setError("Please verify your location to continue.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Auth User
      const userCredential = await signupWithEmail(formData.email, formData.password);
      const user = userCredential.user;

      // 2. Send Verification Email
      await sendEmailVerification(user);

      // 3. Create Firestore Profile (Status: Pending)
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        role: 'institutional_receiver', 
        status: 'pending', // Requires Admin Approval
        location: location,
        address: formData.address,
        createdAt: serverTimestamp(),
        verified: false
      });

      setSuccess(true); // Show Success Message
      setLoading(false);
      
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="glass-card" style={{textAlign:'center', maxWidth:'450px'}}>
          <FaEnvelope size={50} color="#00e599" style={{marginBottom:'1rem'}}/>
          <h2 className="auth-title">Verify Your Email</h2>
          <p style={{color:'#ccc', marginBottom:'1.5rem'}}>
            We sent a verification link to <strong>{formData.email}</strong>.<br/>
            Please verify your email to secure your account.
          </p>
          <div className="error-banner" style={{borderColor:'#00e599', color:'#00e599', background:'rgba(0,229,153,0.1)'}}>
            Note: You also need Admin Approval to access the dashboard.
          </div>
          <button className="btn-primary" onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="glass-card" style={{maxWidth:'500px'}}>
        <button onClick={() => navigate('/register')} style={{background:'none', border:'none', color:'#888', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', marginBottom:'1.5rem'}}>
          <FaArrowLeft /> Back
        </button>

        <h1 className="auth-title">Partner with RePlate</h1>
        <p className="auth-subtitle">Register your NGO/Shelter to receive food donations.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group"><FaBuilding className="input-icon" /><input type="text" className="glass-input" placeholder="Organization Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div className="input-group"><FaEnvelope className="input-icon" /><input type="email" className="glass-input" placeholder="Official Email" required onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
          <div className="input-group"><FaPhone className="input-icon" /><input type="tel" className="glass-input" placeholder="Contact Number" required onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>

          <div style={{marginBottom:'1.2rem'}}>
            <button type="button" className="btn-secondary" onClick={handleGetLocation} style={{borderColor: location ? '#00e599' : '#333', color: location ? '#00e599' : 'white'}}>
              {loading && !location ? <FaSpinner className="icon-spin"/> : location ? <FaCheckCircle/> : <FaMapMarkerAlt/>} {location ? " Location Verified" : " Verify GPS Location (Required)"}
            </button>
          </div>

          <div className="input-group"><FaMapMarkerAlt className="input-icon" /><input type="text" className="glass-input" placeholder="Full Street Address" required onChange={(e) => setFormData({...formData, address: e.target.value})} /></div>
          <div className="input-group"><FaLock className="input-icon" /><input type="password" className="glass-input" placeholder="Create Password" required onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>

          <button className="btn-primary" disabled={loading || !location}>{loading ? 'Registering...' : 'Register Organization'}</button>
        </form>
      </div>
    </div>
  );
};

export default NGORegister;