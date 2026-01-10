import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useAuth } from '../../context/AuthContext';
import { FaUtensils, FaMapMarkerAlt, FaPhone, FaTimes, FaWeightHanging, FaCrosshairs, FaCheckCircle } from 'react-icons/fa';
import './Dashboard.css';

const DonateFoodModal = ({ onClose, onSuccess, preSelectedNGO }) => {
  const { user, dbUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    foodItem: '',
    quantity: '',
    pickupLocation: '',
    phoneNumber: dbUser?.phoneNumber || '',
    lat: null, // Store Exact Coords
    lng: null
  });

  // 1. CAPTURE GPS
  const handleGetGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            pickupLocation: "📍 Current GPS Location Verified" // Visual Feedback
          }));
          setGpsLoading(false);
        },
        (err) => {
          alert("Could not fetch location. Please type address manually.");
          setGpsLoading(false);
        }
      );
    } else {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.phoneNumber.match(/^\+?[0-9]{10,12}$/)) {
      alert("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "donations"), {
        donorId: user.uid,
        donorName: dbUser?.name || user.email,
        donorPhone: formData.phoneNumber,
        foodItem: formData.foodItem,
        quantity: formData.quantity,
        location: formData.pickupLocation, // Text Address
        lat: formData.lat, // EXACT LATITUDE
        lng: formData.lng, // EXACT LONGITUDE
        status: 'pending',
        createdAt: serverTimestamp(),
        targetNgoId: preSelectedNGO ? preSelectedNGO.id : null,
        targetNgoName: preSelectedNGO ? preSelectedNGO.name : 'Broadcast'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Donation Error:", error);
      alert("Failed to place request.");
    }
    setLoading(false);
  };

  // Styles
  const inputContainerStyle = {
    display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0 15px', marginBottom: '1rem'
  };
  const inputStyle = {
    flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '14px 10px', fontSize: '0.95rem', outline: 'none'
  };
  const iconStyle = { color: '#00e599', fontSize: '1rem', minWidth: '20px' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '480px', position:'relative', 
        border:'1px solid rgba(255,255,255,0.1)', background: '#0a0a0a', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        
        <button onClick={onClose} style={{ 
          position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display:'flex', alignItems:'center', justifyContent:'center', color: 'white', cursor: 'pointer' 
        }}><FaTimes size={14} /></button>

        <h2 style={{marginTop:0, fontSize:'1.6rem', marginBottom:'0.5rem'}}>
          {preSelectedNGO ? 'Direct Donation' : 'Broadcast Donation'}
        </h2>
        <p style={{color:'#888', marginBottom:'2rem', fontSize:'0.9rem'}}>
          {preSelectedNGO ? `Offering directly to ${preSelectedNGO.name}.` : "Visible to all nearby NGOs on the map."}
        </p>

        <form onSubmit={handleSubmit}>
          
          {/* Food */}
          <div style={inputContainerStyle}><FaUtensils style={iconStyle}/><input style={inputStyle} placeholder="Food Item (e.g. Rice & Curry)" value={formData.foodItem} onChange={e => setFormData({...formData, foodItem: e.target.value})} required /></div>

          {/* Quantity */}
          <div style={inputContainerStyle}><FaWeightHanging style={iconStyle}/><input style={inputStyle} placeholder="Quantity (e.g. 5kg, 10 Packets)" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required /></div>

          {/* Location + GPS Button */}
          <div style={{...inputContainerStyle, paddingRight: '5px'}}>
            <FaMapMarkerAlt style={iconStyle}/>
            <input style={inputStyle} placeholder="Pickup Address" value={formData.pickupLocation} onChange={e => setFormData({...formData, pickupLocation: e.target.value})} required />
            
            <button type="button" onClick={handleGetGPS} style={{
              background: formData.lat ? 'rgba(0,229,153,0.2)' : 'rgba(255,255,255,0.1)', 
              color: formData.lat ? '#00e599' : '#888',
              border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize:'0.8rem', display:'flex', gap:'5px', alignItems:'center'
            }}>
              {gpsLoading ? '...' : formData.lat ? <><FaCheckCircle/> GPS Set</> : <><FaCrosshairs/> Get GPS</>}
            </button>
          </div>

          {/* Phone */}
          <div style={inputContainerStyle}><FaPhone style={iconStyle}/><input style={inputStyle} placeholder="Phone Number" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required /></div>

          <button className="btn-primary" disabled={loading} style={{marginTop:'1.5rem', padding:'14px'}}>
            {loading ? 'Processing...' : preSelectedNGO ? 'Send to NGO' : 'Broadcast Now'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default DonateFoodModal;