import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { FaUserShield, FaCheck, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSignOutAlt } from 'react-icons/fa';
import '../Dashboard/Dashboard.css'; // Uses shared theme

const AdminDashboard = () => {
  const { dbUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [pendingNGOs, setPendingNGOs] = useState([]);

  useEffect(() => {
    // Only query if user is actually loaded
    if(loading) return; 

    const q = query(collection(db, "users"), where("role", "==", "institutional_receiver"));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingNGOs(all);
    });
  }, [loading]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await updateDoc(doc(db, "users", id), { status: newStatus });
  };

  // 1. Loading State (Prevents premature redirect/render issues)
  if (loading) {
    return <div className="dashboard-layout" style={{justifyContent:'center', alignItems:'center'}}>Loading Admin Panel...</div>;
  }

  // 2. Role Check (Extra safety)
  if (dbUser?.role !== 'admin') {
    return <div className="dashboard-layout" style={{justifyContent:'center', alignItems:'center'}}>Access Denied</div>;
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="brand"><h1>RePlate<span className="highlight">.</span> Admin</h1></div>
        <button onClick={() => { logout(); navigate('/'); }} style={{background:'none', border:'none', color:'#666', cursor:'pointer'}}><FaSignOutAlt size={20}/></button>
      </header>

      <div style={{padding:'3rem', maxWidth:'1200px', margin:'0 auto', width:'100%', overflowY:'auto'}}>
        <h2 style={{color:'white', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'10px'}}>
          <FaUserShield color="#00e599"/> NGO Management
        </h2>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'1.5rem'}}>
          {pendingNGOs.map(ngo => (
            <div key={ngo.id} className="glass-panel" style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <h3 style={{margin:0, fontSize:'1.2rem'}}>{ngo.name}</h3>
                <span className={`status-badge ${ngo.status === 'active' ? 'picked_up' : 'cancelled'}`}>
                  {ngo.status || 'Pending'}
                </span>
              </div>

              <div style={{color:'#aaa', fontSize:'0.9rem', display:'flex', flexDirection:'column', gap:'8px', marginTop:'10px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}><FaEnvelope color="#00e599"/> {ngo.email}</div>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}><FaPhone color="#00e599"/> {ngo.phoneNumber || "No Phone"}</div>
                {ngo.location && (
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}><FaMapMarkerAlt color="#00e599"/> Lat: {ngo.location.lat.toFixed(4)}, Lng: {ngo.location.lng.toFixed(4)}</div>
                )}
                <div style={{fontSize:'0.8rem', color:'#666'}}>ID: {ngo.id}</div>
              </div>

              <div style={{marginTop:'auto', paddingTop:'15px', display:'flex', gap:'10px'}}>
                {ngo.status !== 'active' ? (
                  <button className="btn-primary" onClick={() => toggleStatus(ngo.id, ngo.status)}>
                    <FaCheck/> Approve
                  </button>
                ) : (
                  <button className="btn-action" style={{background:'#333'}} onClick={() => toggleStatus(ngo.id, ngo.status)}>
                    <FaTimes/> Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;