import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaBuilding, 
  FaIdCard, 
  FaEnvelope, 
  FaLock, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaArrowLeft 
} from 'react-icons/fa';
import './Auth.css';

const NGORegister = () => {
  // Destructure the tools we need from AuthContext
  const { signupWithEmail, registerUserInDB } = useAuth();
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    regNo: '' 
  });

  // State for UI interaction
  const [locVerified, setLocVerified] = useState(false);
  const [verifyingLoc, setVerifyingLoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Simulate Geo-Location Lock (Required Step)
  const handleGeoLock = () => {
    setVerifyingLoc(true);
    // Simulate a 1.5s delay to make it feel like "GPS Acquiring"
    setTimeout(() => {
        setLocVerified(true);
        setVerifyingLoc(false);
    }, 1500);
  };

  // 2. The Missing "handleSubmit" Function
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page refresh
    
    // Validation Checks
    if (!locVerified) return alert("Please verify your GPS location first!");
    if (!formData.name || !formData.email || !formData.password || !formData.regNo) {
      return setError("All fields are required.");
    }

    setLoading(true);
    setError('');

    try {
      // Step A: Create the Account in Firebase Auth
      const userCred = await signupWithEmail(formData.email, formData.password);
      
      // Step B: Save NGO specific details to Firestore Database
      // Note: We force the role to 'institutional_receiver' here
      await registerUserInDB(userCred.user.uid, {
        name: formData.name,
        email: formData.email,
        phoneNumber: '', // Phone can be added later if needed
        receiverDetails: {
          registrationId: formData.regNo,
          verificationStatus: 'pending', // Admin must approve this later
          geoVerified: true
        }
      }, 'institutional_receiver');

      // Step C: Redirect to NGO Dashboard (which will show "Pending" screen)
      navigate('/dashboard/ngo');

    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message.replace('Firebase:', '').trim());
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

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Partner Registration</h2>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Join our network of trusted NGOs.
        </p>

        {error && <div className="text-red" style={{textAlign:'center', marginBottom:'1rem'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* Org Name */}
          <div className="form-group">
            <label>Organization Name</label>
            <div className="input-wrapper">
                <FaBuilding className="input-icon" />
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="e.g. Hope Foundation"
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Official Email</label>
            <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input 
                  type="email" 
                  className="styled-input" 
                  placeholder="contact@ngo.org"
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Create Password</label>
            <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  className="styled-input" 
                  placeholder="Min 6 chars"
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
            </div>
          </div>

          {/* Reg ID */}
          <div className="form-group">
            <label>Govt Registration ID (Darpan/Trust)</label>
            <div className="input-wrapper">
                <FaIdCard className="input-icon" />
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="e.g. AAAT1234F"
                  required 
                  value={formData.regNo}
                  onChange={(e) => setFormData({...formData, regNo: e.target.value})} 
                />
            </div>
          </div>

          {/* Location Verification Button */}
          <button 
            type="button" 
            className={`auth-btn btn-ghost ${locVerified ? 'active-success' : ''}`} 
            onClick={handleGeoLock} 
            disabled={locVerified || verifyingLoc}
            style={{ marginBottom: '1.5rem', borderColor: locVerified ? '#00e599' : 'rgba(255,255,255,0.2)' }}
          >
            {verifyingLoc ? "Acquiring Signal..." : locVerified ? <><FaCheckCircle /> Location Verified</> : <><FaMapMarkerAlt /> Verify GPS Location</>}
          </button>

          {/* Submit Button */}
          <button type="submit" className="auth-btn btn-primary" disabled={loading || !locVerified}>
            {loading ? 'Submitting Application...' : 'Register Organization'}
          </button>

        </form>

        <p className="auth-footer" style={{marginTop:'1.5rem'}}>
           <span className="link-text" onClick={() => navigate('/register')}>
             <FaArrowLeft style={{marginRight:'5px'}}/> Back
           </span>
        </p>

      </div>
    </div>
  );
};

export default NGORegister;