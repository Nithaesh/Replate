import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaMobileAlt, FaLock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import './Auth.css';

const PhoneVerification = () => {
  const { user, sendOtp, updateUserPhoneStatus } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmObj, setConfirmObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
      const res = await sendOtp(formatted);
      setConfirmObj(res);
      setStep(2);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await confirmObj.confirm(otp);
      await updateUserPhoneStatus(user.uid, phone);
      // Auto Redirect after success
      navigate(user.role === 'institutional_receiver' ? '/dashboard/ngo' : '/dashboard/donor');
    } catch (err) { setError("Invalid OTP code."); setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <div style={{background:'rgba(0,229,153,0.1)', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem auto'}}>
          <FaMobileAlt size={24} color="#00e599"/>
        </div>

        <h2 className="auth-title">Secure Your Account</h2>
        <p className="auth-subtitle">We need to verify your phone number to connect you with real donors/receivers.</p>

        {error && <div className="error-banner">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSend}>
            <div className="input-group">
              <input className="glass-input" style={{paddingLeft:'20px', textAlign:'center'}} 
                placeholder="+91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)} required/>
            </div>
            <div id="recaptcha-container"></div>
            <button className="btn-primary" disabled={loading}>{loading ? 'Sending Code...' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
             <div className="input-group">
               <FaLock className="input-icon" />
               <input className="glass-input" style={{paddingLeft:'45px', letterSpacing:'4px', fontSize:'1.1rem'}} 
                 placeholder="Enter 6-digit OTP" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value)} required/>
             </div>
             <button className="btn-primary" disabled={loading}>
               {loading ? 'Verifying...' : 'Verify & Continue'} <FaArrowRight/>
             </button>
             <button type="button" className="btn-secondary" style={{marginTop:'1rem'}} onClick={()=>setStep(1)}>Change Number</button>
          </form>
        )}
      </div>
    </div>
  );
};
export default PhoneVerification;