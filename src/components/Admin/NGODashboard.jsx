import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, orderBy, updateDoc, doc, getDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  FaLeaf, FaHistory, FaSignOutAlt, FaUserCircle, FaMapMarkedAlt, FaCheck, FaTimes, FaLock, 
  FaUtensils, FaMapMarkerAlt, FaCommentDots, FaPaperPlane 
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../Dashboard/Dashboard.css'; // Reusing the shared CSS

// --- ICONS ---
import iconShadow from 'leaflet/dist/images/marker-icon.png';
// Red Icon for Pending Donations
const redIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
// Green Icon for Accepted Tasks
const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

// Helper: Calculate Distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; 
  const dLat = (lat2-lat1) * (Math.PI/180);
  const dLon = (lon2-lon1) * (Math.PI/180);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180)) * Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return (R * c).toFixed(1);
};

const NGODashboard = () => {
  const { user, dbUser, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [currentView, setCurrentView] = useState('overview');
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [ngoLocation, setNgoLocation] = useState(null);
  
  // Chat State
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  // 1. SECURITY CHECK (Keep the Admin Approval Lock)
  if (dbUser?.status === 'pending') {
    return (
      <div style={{minHeight:'100vh', background:'#0a0a0a', display:'flex', justifyContent:'center', alignItems:'center', color:'white', fontFamily:'sans-serif'}}>
        <div style={{textAlign:'center', padding:'3rem', border:'1px solid #333', borderRadius:'20px', background:'#111'}}>
           <FaLock style={{fontSize:'3rem', color:'#f59e0b', marginBottom:'1rem'}}/>
           <h2>Account Pending Approval</h2>
           <p style={{color:'#888', marginBottom:'2rem'}}>Admin verification is required before you can accept donations.</p>
           <button onClick={logout} className="auth-btn" style={{background:'#333', color:'white'}}>Logout</button>
        </div>
      </div>
    );
  }

  // 2. INITIAL LOAD (GPS)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setNgoLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("GPS Error", err)
      );
    }
  }, []);

  // 3. FETCH REQUESTS (Real-time)
  useEffect(() => {
    if (!user) return;

    // Query A: Available Donations (Status = Pending)
    const qAvailable = query(collection(db, "donations"), where("status", "==", "pending"));
    
    // Query B: My Active Tasks (Status = Assigned AND I am the volunteer)
    const qMyTasks = query(collection(db, "donations"), where("status", "==", "assigned"), where("volunteerId", "==", user.uid));

    const unsub1 = onSnapshot(qAvailable, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter: Show donations that are EITHER (Public) OR (Directly sent to ME)
      const filtered = list.filter(d => !d.targetNgoId || d.targetNgoId === user.uid);
      setAvailableRequests(filtered);
    });

    const unsub2 = onSnapshot(qMyTasks, (snap) => {
      setMyTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  // 4. CHAT LOGIC
  useEffect(() => {
    if (!activeChatId || !showChat) return;
    const q = query(collection(db, `donations/${activeChatId}/messages`), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => setChatMessages(snap.docs.map(d => d.data())));
    return () => unsub();
  }, [activeChatId, showChat]);

  const openChat = (donationId) => {
    setActiveChatId(donationId);
    setShowChat(true);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    await addDoc(collection(db, `donations/${activeChatId}/messages`), {
      text: newMessage, sender: 'ngo', timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  // 5. ACCEPT DONATION LOGIC
  const handleAccept = async (donationId) => {
    try {
      await updateDoc(doc(db, "donations", donationId), {
        status: 'assigned',
        volunteerId: user.uid,
        volunteerName: dbUser.name,
        acceptedAt: serverTimestamp()
      });
      alert("Donation Accepted! View it in 'My Active Pickups'.");
    } catch (err) { alert("Error accepting: " + err.message); }
  };

  // 6. COMPLETE PICKUP LOGIC
  const handleComplete = async (donationId) => {
    if(!window.confirm("Confirm food pickup complete?")) return;
    await updateDoc(doc(db, "donations", donationId), { status: 'picked_up' });
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">RePlate<span className="dot">.</span></div>
        <nav>
          <button className={`nav-item ${currentView==='overview'?'active':''}`} onClick={()=>setCurrentView('overview')}><FaMapMarkedAlt /> Live Feed</button>
          <button className={`nav-item ${currentView==='tasks'?'active':''}`} onClick={()=>setCurrentView('tasks')}><FaLeaf /> My Pickups</button>
          <button className={`nav-item ${currentView==='history'?'active':''}`} onClick={()=>setCurrentView('history')}><FaHistory /> History</button>
        </nav>
        <button className="logout-btn" onClick={async()=>{await logout(); navigate('/login');}}><FaSignOutAlt /> Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-content fade-in">
        <header className="content-header">
          <div>
             <h1>{currentView === 'overview' ? 'Donation Feed 📡' : 'My Tasks 🚚'}</h1>
             <p className="subtitle">{dbUser?.name} • Authorized Partner</p>
          </div>
          <div className="user-pill"><FaUserCircle /><span>{dbUser?.name}</span></div>
        </header>

        {/* --- VIEW: LIVE FEED & MAP --- */}
        {currentView === 'overview' && (
          <div style={{display:'flex', gap:'1.5rem', height:'100%'}}>
            
            {/* LEFT: MAP (60%) */}
            <div className="map-section" style={{flex:2}}>
              <div className="map-header-bar">
                 <h3>Live Donor Map</h3>
                 <span className="badge dist">{availableRequests.length} Pending</span>
              </div>
              <div className="map-container-wrapper">
                 <MapContainer center={ngoLocation ? [ngoLocation.lat, ngoLocation.lng] : [20, 78]} zoom={13} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                    
                    {/* My Location */}
                    {ngoLocation && <Marker position={[ngoLocation.lat, ngoLocation.lng]} icon={greenIcon}><Popup>Your HQ</Popup></Marker>}
                    
                    {/* Donor Markers */}
                    {availableRequests.map(req => req.location && (
                       <Marker key={req.id} position={[req.location.lat, req.location.lng]} icon={redIcon}>
                          <Popup>
                             <strong>{req.foodItem}</strong><br/>
                             {req.quantity} servings<br/>
                             <button onClick={()=>handleAccept(req.id)} style={{background:'#00e599', border:'none', marginTop:'5px', cursor:'pointer'}}>Accept</button>
                          </Popup>
                       </Marker>
                    ))}
                 </MapContainer>
              </div>
            </div>

            {/* RIGHT: FEED LIST (40%) */}
            <div className="right-sidebar" style={{width:'35%', background:'#161616', borderLeft:'none', borderRadius:'20px', border:'1px solid #333'}}>
               <h3>Incoming Requests</h3>
               <div className="feed-section">
                  {availableRequests.length === 0 ? <p style={{color:'#666', textAlign:'center', marginTop:'2rem'}}>No pending donations nearby.</p> : 
                    availableRequests.map(req => (
                      <div key={req.id} className="request-card slide-up">
                         <div className="request-header">
                            <div>
                               <h4 style={{margin:0, fontSize:'1.1rem'}}>{req.foodItem}</h4>
                               <p style={{margin:'5px 0', color:'#888', fontSize:'0.9rem'}}><FaUtensils size={10}/> {req.quantity} Servings</p>
                            </div>
                            <span className="badge food">{req.targetNgoId ? 'Direct Request' : 'General'}</span>
                         </div>
                         
                         <div className="request-badges">
                            <span className="badge"><FaMapMarkerAlt size={10}/> {req.location && ngoLocation ? `${calculateDistance(ngoLocation.lat, ngoLocation.lng, req.location.lat, req.location.lng)} km` : 'N/A'}</span>
                            <span className="badge">{req.pickupAddress.slice(0, 15)}...</span>
                         </div>

                         <button className="accept-btn" onClick={() => handleAccept(req.id)}>
                            <FaCheck /> Accept Pickup
                         </button>
                      </div>
                    ))
                  }
               </div>
            </div>
          </div>
        )}

        {/* --- VIEW: MY TASKS --- */}
        {currentView === 'tasks' && (
           <div className="stats-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))'}}>
              {myTasks.length === 0 ? <p style={{color:'#666'}}>No active tasks. Go to Live Feed to accept one.</p> :
                myTasks.map(task => (
                   <div key={task.id} className="stat-card glow-green" style={{flexDirection:'column', alignItems:'flex-start'}}>
                      <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                         <div className="status-pill assigned">Active Pickup</div>
                         <button onClick={()=>openChat(task.id)} style={{background:'transparent', border:'none', color:'white', cursor:'pointer'}}><FaCommentDots size={18}/></button>
                      </div>
                      
                      <h3 style={{margin:'10px 0'}}>{task.foodItem}</h3>
                      <p style={{color:'#888'}}>{task.quantity} servings • {task.pickupAddress}</p>
                      
                      <button className="accept-btn" style={{background:'#333', color:'white', border:'1px solid #555'}} onClick={()=>handleComplete(task.id)}>
                         <FaCheck /> Mark as Picked Up
                      </button>
                   </div>
                ))
              }
           </div>
        )}

        {/* CHAT WINDOW (Shared) */}
        {showChat && (
           <div className="chat-window slide-up">
              <div className="chat-header"><span>Donor Chat</span><FaTimes onClick={()=>setShowChat(false)} style={{cursor:'pointer'}}/></div>
              <div className="chat-messages">
                 {chatMessages.map((m,i)=><div key={i} className={`chat-bubble ${m.sender==='ngo'?'mine':'theirs'}`}>{m.text}</div>)}
              </div>
              <form className="chat-input-area" onSubmit={sendMessage}>
                 <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} placeholder="Type msg..." />
                 <button className="chat-send-btn"><FaPaperPlane/></button>
              </form>
           </div>
        )}
      </main>
    </div>
  );
};

export default NGODashboard;