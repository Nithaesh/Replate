import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaBoxOpen, FaTruck, FaMapMarkerAlt, FaPaperPlane, FaUserCircle, FaSignOutAlt, FaExclamationTriangle, FaHistory, FaGlobe } from 'react-icons/fa';
import '../Dashboard/Dashboard.css'; 

const NGODashboard = () => {
  const { user, dbUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [ngoLocation, setNgoLocation] = useState(null);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [leftView, setLeftView] = useState('ops'); 
  const [rightView, setRightView] = useState('list'); 
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const scrollRef = useRef();

  // 1. Get Exact NGO Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setNgoLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setNgoLocation({ lat: 19.0760, lng: 72.8777 })
      );
    }
  }, []);

  // 2. Fetch Requests (Exact Data Only)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "donations"), where("status", "in", ["pending", "accepted", "picked_up", "completed", "cancelled"]), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      setRequests(all.filter(d => d.status === 'pending'));
      setActiveOrders(all.filter(d => ['accepted', 'picked_up'].includes(d.status)));
      setHistoryOrders(all.filter(d => ['completed', 'cancelled'].includes(d.status)));
    });
  }, [user]);

  // 3. Chat Sync
  useEffect(() => {
    if (!selectedOrder) return;
    const q = query(collection(db, `donations/${selectedOrder.id}/messages`), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => d.data()));
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [selectedOrder]);

  const handleAccept = async (order) => {
    await updateDoc(doc(db, "donations", order.id), { status: 'accepted', ngoId: user.uid, ngoName: dbUser?.name });
    await addDoc(collection(db, `donations/${order.id}/messages`), { 
      text: "⚠ SYSTEM: Please verify donor phone before pickup.", sender: "system", isSystem: true, timestamp: serverTimestamp() 
    });
    setSelectedOrder({ ...order, status: 'accepted' });
    setRightView('chat');
  };

  const handleUpdateStatus = async (id, status) => {
    await updateDoc(doc(db, "donations", id), { status });
    if (selectedOrder?.id === id) setSelectedOrder(prev => ({...prev, status}));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    await addDoc(collection(db, `donations/${selectedOrder.id}/messages`), { 
      text: inputMsg, sender: "ngo", senderName: dbUser?.name, timestamp: serverTimestamp() 
    });
    setInputMsg("");
  };

  if (loading) return <div className="dashboard-layout">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="brand"><h1>RePlate<span className="highlight">.</span></h1></div>
        <div style={{display:'flex', gap:'1rem'}}>
          <button className={`nav-btn ${leftView==='ops'?'active':''}`} style={{width:'auto'}} onClick={()=>setLeftView('ops')}><FaGlobe/> Ops</button>
          <button className={`nav-btn ${leftView==='history'?'active':''}`} style={{width:'auto'}} onClick={()=>setLeftView('history')}><FaHistory/> History</button>
        </div>
        <div className="user-profile"><span>{dbUser?.name}</span> <FaUserCircle size={24} /> <button onClick={() => { logout(); navigate('/'); }} style={{background:'none', border:'none', color:'#666'}}><FaSignOutAlt/></button></div>
      </header>

      <div className="ngo-grid">
        <div className="col-ops">
          {leftView === 'ops' ? (
            <>
              <div className="map-wrapper-ngo">
                {ngoLocation && (
                  <MapContainer center={[ngoLocation.lat, ngoLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    
                    {/* HQ Marker */}
                    <CircleMarker center={[ngoLocation.lat, ngoLocation.lng]} radius={8} pathOptions={{ color: '#00e599', fillColor: '#00e599', fillOpacity: 0.8 }}><Popup>HQ</Popup></CircleMarker>
                    
                    {/* Requests (ONLY RENDER IF GPS DATA EXISTS) */}
                    {requests.map(req => {
                      if (!req.lat || !req.lng) return null; // Accurate Check
                      return (
                        <CircleMarker key={req.id} center={[req.lat, req.lng]} radius={6} pathOptions={{ color: '#FFB300', fillColor: '#FFB300', fillOpacity: 0.9 }}>
                          <Popup><strong>{req.foodItem}</strong><br/>{req.quantity}</Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                )}
              </div>
              <h3 style={{color:'white', margin:0}}><FaBoxOpen/> Pending Requests ({requests.length})</h3>
              {requests.map(req => (
                <div key={req.id} className="glass-panel">
                  <h4 style={{margin:'0 0 5px 0'}}>{req.foodItem} <span style={{fontSize:'0.8rem', color:'#888'}}>({req.quantity})</span></h4>
                  <p style={{color:'#888', margin:'0 0 10px 0'}}><FaMapMarkerAlt/> {req.location}</p>
                  <button className="btn-primary" onClick={() => handleAccept(req)}>Accept Request</button>
                </div>
              ))}
            </>
          ) : (
            <>
              <h3 style={{color:'white', margin:0}}><FaHistory/> Order History</h3>
              {historyOrders.map(order => (
                <div key={order.id} className="glass-panel" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div><h4>{order.foodItem} ({order.quantity})</h4><p style={{color:'#888', margin:0}}>{order.donorName}</p></div>
                   <span className={`status-pill ${order.status}`}>{order.status}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="col-task">
          {rightView === 'list' && (
            <div style={{padding:'1.5rem', flex:1, overflowY:'auto'}}>
              <h3 style={{color:'white', marginTop:0}}><FaTruck/> Active Operations ({activeOrders.length})</h3>
              {activeOrders.map(order => (
                <div key={order.id} className="glass-panel" onClick={() => { setSelectedOrder(order); setRightView('chat'); }} style={{marginBottom:'1rem', cursor:'pointer', borderLeft:'3px solid #00e599'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><h4>{order.foodItem}</h4><span className={`status-pill ${order.status}`}>{order.status.replace('_',' ')}</span></div>
                  <p style={{color:'#888', margin:0}}>{order.donorName} • {order.quantity}</p>
                </div>
              ))}
            </div>
          )}

          {rightView === 'chat' && selectedOrder && (
            <div className="chat-container">
              <div className="chat-header">
                <button onClick={() => setRightView('list')} style={{background:'none', border:'none', color:'#888', cursor:'pointer'}}>Back</button>
                <div style={{display:'flex', gap:'10px'}}>
                   {selectedOrder.status === 'accepted' && <button className="btn-secondary" onClick={() => handleUpdateStatus(selectedOrder.id, 'picked_up')}>Start Pickup</button>}
                   {selectedOrder.status === 'picked_up' && <button className="btn-primary" style={{width:'auto'}} onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}>Complete</button>}
                </div>
              </div>
              <div className="chat-messages">
                {messages.map((m, i) => <div key={i} className={`msg ${m.isSystem ? 'system' : m.sender === 'ngo' ? 'sent' : 'received'}`}>{m.isSystem && <FaExclamationTriangle style={{marginRight:5}}/>}{m.text}</div>)}
                <div ref={scrollRef} />
              </div>
              <form className="chat-input-bar" onSubmit={handleSend}>
                <input className="chat-input-field" value={inputMsg} onChange={e => setInputMsg(e.target.value)} placeholder="Message donor..." />
                <button className="chat-send-btn"><FaPaperPlane/></button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default NGODashboard;