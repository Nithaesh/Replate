import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaBuilding, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    organizationName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setTimeout(() => setStep(2), 200); // Slight delay for visual feedback
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      console.log("Registering User:", formData);
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
           <div className="logo-text" onClick={() => navigate('/')}>RePlate<span className="dot">.</span></div>
          <p className="auth-subtitle">
            {step === 1 ? 'Choose how you want to join us' : 'Complete your profile'}
          </p>
        </div>
        
        {step === 1 && (
          <div className="fade-in">
            <div className="role-grid">
              <div 
                className={`role-card ${formData.role === 'DONOR' ? 'active' : ''}`} 
                onClick={() => handleRoleSelect('DONOR')}
              >
                <FaBuilding className="role-icon" />
                <h3>Donor</h3>
                <p>Restaurant, Hotel, or Individual</p>
              </div>

              <div 
                className={`role-card ${formData.role === 'RECIPIENT' ? 'active' : ''}`} 
                onClick={() => handleRoleSelect('RECIPIENT')}
              >
                <FaUser className="role-icon" />
                <h3>NGO / Shelter</h3>
                <p>Looking for food support</p>
              </div>
            </div>
            <p className="auth-footer">
              Already have an account? <Link to="/login" className="link-text">Login</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="fade-in">
            <div className="form-group">
              <label>Organization / Name</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input type="text" name="organizationName" className="styled-input" placeholder="e.g. City Bakery" required onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" className="styled-input" placeholder="you@example.com" required onChange={handleChange} />
              </div>
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type="password" name="password" className="styled-input" placeholder="••••••••" required onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input type="tel" name="phone" className="styled-input" placeholder="+91 98765 43210" required onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="auth-btn btn-primary">
              Create Account <FaArrowRight />
            </button>
            
            <button type="button" className="auth-btn btn-ghost" onClick={() => setStep(1)}>
              <FaArrowLeft /> Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;