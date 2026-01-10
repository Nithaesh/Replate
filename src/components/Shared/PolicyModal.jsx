import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaShieldAlt, FaHandHoldingHeart, FaCheckCircle } from 'react-icons/fa';
import '../Auth/Auth.css'; // Uses existing styles

const PolicyModal = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleAgree = async () => {
    setLoading(true);
    try {
      // Mark policy as seen in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { hasSeenPolicies: true });
      onClose(); // Close the modal
    } catch (err) {
      console.error("Error accepting policies:", err);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '550px', textAlign: 'left', animation: 'slideUpFade 0.4s ease' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(0,229,153,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <FaShieldAlt size={24} color="#00e599" />
          </div>
          <h2 className="auth-title">Community Guidelines</h2>
          <p className="auth-subtitle">Please accept our policies to continue.</p>
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px', marginBottom: '1.5rem', color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6' }}>
          
          <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHandHoldingHeart color="#00e599" /> Purpose of RePlate
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            This platform exists to reduce food waste and help communities. We connect genuine donors with NGOs to facilitate efficient food distribution.
          </p>

          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Food Safety & Hygiene</h4>
          <p style={{ marginBottom: '1rem' }}>
            Ensure all donated food is <strong>fresh, hygienic, and safe</strong> for consumption. Do not donate expired or spoiled food. You are responsible for the quality of your donation.
          </p>

          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Verification Responsibility</h4>
          <p style={{ marginBottom: '1rem' }}>
            <strong>For NGOs:</strong> You must verify the donor details via phone call before proceeding with any pickup.
            <br/>
            <strong>For Donors:</strong> Provide accurate contact details to facilitate smooth coordination.
          </p>

          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Zero Tolerance Policy</h4>
          <p style={{ marginBottom: '0' }}>
            Misuse of the platform, false listings, or harassment will result in immediate account suspension. Please use this service responsibly and with genuine intent.
          </p>
        </div>

        <button className="btn-primary" onClick={handleAgree} disabled={loading}>
          {loading ? 'Processing...' : <><FaCheckCircle /> I Understand & Agree</>}
        </button>

      </div>
    </div>
  );
};

export default PolicyModal;