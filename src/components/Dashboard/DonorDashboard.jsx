import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLeaf, FaHistory, FaHandHoldingHeart, FaUserCircle, FaSignOutAlt, FaPaperPlane, FaArrowLeft, FaStar, FaBoxOpen } from 'react-icons/fa';
import DonateFoodModal from './DonateFoodModal'; 
import PolicyModal from '../Shared/PolicyModal'; 
import './Dashboard.css';

const DonorDashboard = () => {
  const { user, dbUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('overview'); 
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyNGOs, setNearbyNGOs] = useState([]);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef();
  
  const [stats, setStats] = useState({ meals: 0, karma: 0, badge: 'Bronze' });
  const [showDonate, setShowDonate] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [preSelectedNGO, setPreSelectedNGO] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          const q = query(collection(db, "users"), where("role", "==", "institutional_receiver"));
          const snap = await getDocs(q);
          const realNGOs = snap.docs.map(d => {
            const data = d.data();
            if(data.location && data.location.lat) return { id: d.id, ...data };
            return null;
          }).filter(n => n!==null);
          setNearbyNGOs(realNGOs);
        },
        () => setUserLocation({ lat: 19.0760, lng: 72.8777 }) 
      );
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "donations"), where("donorId", "==", user.uid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveOrders(all.filter(d => ['pending', 'accepted', 'picked_up'].includes(d.status)));
      setHistoryOrders(all.filter(d => ['completed', 'cancelled'].includes(d.status)));
      const completed = all.filter(d => d.status === 'completed');
      const meals = completed.reduce((sum, o) => sum + (parseInt(o.quantity)||0), 0);
      setStats({ meals, karma: (meals*10) + (completed.length*50), badge: meals > 50 ? 'Gold' : meals > 10 ? 'Silver' : 'Bronze' });
    });
  }, [user]);

  useEffect(() => {
    if (!selectedOrder) return;
    const q = query(collection(db, `donations/${selectedOrder.id}/messages`), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => d.data()));
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [selectedOrder]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await addDoc(collection(db, `donations/${selectedOrder.id}/messages`), {
      text: chatInput, sender: "donor", senderName: dbUser?.name, timestamp: serverTimestamp()
    });
    setChatInput("");
  };

  const handleDirectDonate = (ngo) => {
    setPreSelectedNGO(ngo);
    setShowDonate(true);
  };

  if (loading) return <div className="dashboard-layout">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="brand"><h1>RePlate<span className="highlight">.</span></h1></div>
        <div className="user-profile"><span>{dbUser?.name}</span> <FaUserCircle size={24} /> <button onClick={()=>{logout(); navigate('/')}} style={{background:'none', border:'none', color:'#666'}}><FaSignOutAlt/></button></div>
      </header>

      <div className="donor-grid">
        <div className="sidebar">
          <button className="btn-primary" onClick={() => {setPreSelectedNGO(null); setShowDonate(true);}}><FaHandHoldingHeart /> Broadcast Donation</button>
          <nav>
            <button className={`nav-btn ${view==='overview'?'active':''}`} onClick={()=>setView('overview')}><FaLeaf/> Overview</button>
            <button className={`nav-btn ${view==='history'?'active':''}`} onClick={()=>setView('history')}><FaHistory/> History</button>
          </nav>
          <div className="glass-panel" style={{marginTop:'auto'}}>
            <div style={{color:'#888', fontSize:'0.9rem'}}>Karma Points</div>
            <div style={{fontSize:'1.8rem', fontWeight:'bold', color:'#FFB300', display:'flex', alignItems:'center', gap:'10px'}}><FaStar/> {stats.karma}</div>
            <div style={{fontSize:'0.8rem', color:'#888'}}>Level: {stats.badge}</div>
          </div>
        </div>

        <div className="content-area">
          {view === 'overview' && (
            <>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1.5rem'}}>
                <div className="stat-card">
                  <div className="stat-icon-box" style={{background:'rgba(0,229,153,0.1)', color:'#00e599'}}><FaLeaf/></div>
                  <div><h3 style={{margin:0, fontSize:'1.5rem'}}>{stats.meals}</h3><p style={{margin:0, color:'#888'}}>Meals Saved</p></div>
                </div>
                <div className="stat-card">
                   <div className="stat-icon-box" style={{background:'rgba(33,150,243,0.1)', color:'#2196F3'}}><FaBoxOpen/></div>
                   <div><h3 style={{margin:0, fontSize:'1.5rem'}}>{activeOrders.length}</h3><p style={{margin:0, color:'#888'}}>Active Orders</p></div>
                </div>
              </div>

              <div className="map-wrapper-donor">
                {userLocation ? (
                  <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={8} pathOptions={{ color: '#00e599', fillColor: '#00e599', fillOpacity: 0.8 }}><Popup>You</Popup></CircleMarker>
                    {nearbyNGOs.map(ngo => (
                      <CircleMarker key={ngo.id} center={[ngo.location.lat, ngo.location.lng]} radius={6} pathOptions={{ color: '#2196F3', fillColor: '#2196F3', fillOpacity: 0.8 }}>
                        <Popup><strong>{ngo.name}</strong><br/><button style={{marginTop:'5px', padding:'5px', background:'#00e599', border:'none', cursor:'pointer', borderRadius:'4px'}} onClick={() => handleDirectDonate(ngo)}>Donate Here</button></Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                ) : <div style={{padding:'2rem'}}>Locating...</div>}
              </div>

              <h3 style={{margin:'0'}}>Active Donations</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem'}}>
                {activeOrders.length === 0 ? <div style={{color:'#666'}}>No active donations.</div> : activeOrders.map(order => (
                  <div key={order.id} className="glass-panel" onClick={() => {setSelectedOrder(order); setView('chat')}} style={{cursor:'pointer', borderLeft:'3px solid #00e599'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                      <span style={{fontWeight:'700'}}>{order.foodItem}</span>
                      <span className={`status-pill ${order.status}`}>{order.status.replace('_',' ')}</span>
                    </div>
                    <p style={{color:'#888', margin:0, fontSize:'0.9rem'}}>{order.quantity} • {order.location}</p>
                    {order.status !== 'pending' && <p style={{color:'#00e599', fontSize:'0.8rem', marginTop:'10px'}}>Click to Chat</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'history' && (
             <div>
               <h3>Donation History</h3>
               {historyOrders.map(order => (
                 <div key={order.id} className="glass-panel" style={{marginBottom:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div><h4 style={{margin:'0 0 5px 0'}}>{order.foodItem} ({order.quantity})</h4><p style={{color:'#888', margin:0}}>Picked up by: {order.ngoName || "Unknown"}</p></div>
                   <span className={`status-pill ${order.status}`}>{order.status}</span>
                 </div>
               ))}
             </div>
          )}

          {view === 'chat' && selectedOrder && (
            <div className="chat-container">
              <div className="chat-header">
                <button onClick={()=>setView('overview')} style={{background:'none', border:'none', color:'#888', cursor:'pointer'}}><FaArrowLeft/> Back</button>
                <h4 style={{margin:0}}>Chat with {selectedOrder.ngoName || "NGO"}</h4>
              </div>
              <div className="chat-messages">
                {messages.map((m,i) => <div key={i} className={`msg ${m.isSystem?'system':m.sender==='donor'?'sent':'received'}`}>{m.text}</div>)}
                <div ref={scrollRef}/>
              </div>
              
              {/* --- FIXED CHAT INPUT BAR --- */}
              <form className="chat-input-bar" onSubmit={handleSendChat}>
                <input className="chat-input-field" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type a message..."/>
                <button className="chat-send-btn"><FaPaperPlane/></button>
              </form>
            </div>
          )}
        </div>
      </div>
      {showDonate && <DonateFoodModal onClose={() => setShowDonate(false)} preSelectedNGO={preSelectedNGO} onSuccess={() => alert("Donation Placed!")} />}
      {showPolicy && <PolicyModal onClose={() => setShowPolicy(false)} user={user} />}
    </div>
  );
};
export default DonorDashboard;