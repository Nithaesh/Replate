import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { 
  collection, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp, updateDoc, doc, increment, getDocs 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaLeaf, FaHistory, FaMedal, FaStar, FaTruck, FaCheckCircle, 
  FaUserCircle, FaSignOutAlt, FaTimes, FaMapMarkerAlt, FaBuilding, FaPaperPlane, FaCommentDots 
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Dashboard.css';

// --- ICONS ---
import iconShadow from 'leaflet/dist/images/marker-icon.png';
const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const blueIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

// --- HELPER: Generate Consistent Fake Location around User ---
// This ensures NGOs always appear "nearby" for the demo, even if they lack real GPS
const getSmartDemoLocation = (userLat, userLng, index) => {
  const r = 0.02; // Roughly 2-3km radius
  // Use index to create a fixed offset so they don't jump around
  const angle = (index * 75) * (Math.PI / 180); 
  return {
    lat: userLat + (r * Math.cos(angle)),
    lng: userLng + (r * Math.sin(angle))
  };
};

const DonorDashboard = () => {
  const { user, dbUser, logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [currentView, setCurrentView] = useState('overview');
  const [activeDonation, setActiveDonation] = useState(null);
  const [nearbyNGOs, setNearbyNGOs] = useState([]);
  const [filteredNGOs, setFilteredNGOs] = useState([]); 
  const [pastDonations, setPastDonations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false); // New: Prevents map jump

  // UI
  const [showModal, setShowModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Form
  const [formData, setFormData] = useState({ 
    foodItem: '', quantity: '', pickupAddress: dbUser?.address || '', notes: '', 
    targetNgoId: null, targetNgoName: null 
  });

  // 1. INITIAL LOAD: Get GPS First, Then Load NGOs
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const uLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(uLoc);
          setIsMapReady(true); // Map is ready to show

          // Fetch NGOs and place them around the user
          const q = query(collection(db, "users"), where("role", "==", "institutional_receiver"), where("status", "==", "active"));
          const snapshot = await getDocs(q);
          
          const processedNGOs = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            // Demo Logic: If NGO has no location, place them near the user
            const location = data.location || getSmartDemoLocation(uLoc.lat, uLoc.lng, index);
            
            // Calculate distance
            const dist = calculateDistance(uLoc.lat, uLoc.lng, location.lat, location.lng);

            return { id: doc.id, ...data, simLat: location.lat, simLng: location.lng, distance: dist };
          });
          
          setNearbyNGOs(processedNGOs.sort((a,b) => a.distance - b.distance));
          setFilteredNGOs(processedNGOs);
        },
        (err) => { 
          console.log("GPS Error", err); 
          // Fallback to India Center if denied
          setUserLocation({ lat: 20.5937, lng: 78.9629 });
          setIsMapReady(true);
        } 
      );
    }
  }, []);

  // Distance Calc Helper
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2-lat1) * (Math.PI/180);
    const dLon = (lon2-lon1) * (Math.PI/180);
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180)) * Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return c.toFixed(1);
  };

  // 2. LISTENERS
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "donations"), where("donorId", "==", user.uid), where("status", "in", ["pending", "assigned", "picked_up"]), orderBy("createdAt", "desc"), limit(1));
    const unsub1 = onSnapshot(q, (snap) => setActiveDonation(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }));
    
    // History Listener
    const qHist = query(collection(db, "donations"), where("donorId", "==", user.uid), orderBy("createdAt", "desc"), limit(10));
    const unsub2 = onSnapshot(qHist, (snap) => setPastDonations(snap.docs.map(d=>({id:d.id, ...d.data()}))));

    return () => { unsub1(); unsub2(); };
  }, [user]);

  // 3. CHAT LISTENER (Fixed)
  useEffect(() => {
    if (!activeDonation || !showChat) return;
    const q = query(collection(db, `donations/${activeDonation.id}/messages`), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => setChatMessages(snap.docs.map(doc => doc.data())));
    return () => unsub();
  }, [activeDonation, showChat]);

  // 4. HANDLERS
  const handleDonateOpen = (ngo = null) => {
    setFormData({
      foodItem: '', quantity: '', pickupAddress: dbUser?.address || '', notes: '',
      targetNgoId: ngo ? ngo.id : null,
      targetNgoName: ngo ? ngo.name : null
    });
    setShowModal(true);
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "donations"), {
        donorId: user.uid, donorName: dbUser?.name || "Anonymous",
        foodItem: formData.foodItem, quantity: formData.quantity, pickupAddress: formData.pickupAddress,
        location: userLocation, targetNgoId: formData.targetNgoId, targetNgoName: formData.targetNgoName,
        status: 'pending', createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", user.uid), { "donorDetails.totalDonations": increment(1) });
      setLoading(false); setShowModal(false);
    } catch (err) { alert(err.message); setLoading(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeDonation) return;
    
    try {
      await addDoc(collection(db, `donations/${activeDonation.id}/messages`), {
        text: newMessage, 
        sender: 'donor', 
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Chat Error:", err);
      alert("Message failed. Try again.");
    }
  };

  // Auto-Center Map Component
  const RecenterMap = ({ lat, lng }) => { 
    const map = useMap(); 
    useEffect(() => { if(lat && lng) map.setView([lat, lng], 14, { animate: true }); }, [lat, lng]); 
    return null; 
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">RePlate<span className="dot">.</span></div>
        <nav>
          <button className={`nav-item ${currentView==='overview'?'active':''}`} onClick={()=>setCurrentView('overview')}><FaLeaf /> Overview</button>
          <button className={`nav-item ${currentView==='history'?'active':''}`} onClick={()=>setCurrentView('history')}><FaHistory /> History</button>
        </nav>
        <button className="logout-btn" onClick={async()=>{await logout(); navigate('/login');}}><FaSignOutAlt /> Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-content fade-in">
        <header className="content-header">
          <div><h1>Hello, {dbUser?.name?.split(' ')[0]} 👋</h1></div>
          <div className="user-pill"><FaUserCircle /><span>{dbUser?.name}</span></div>
        </header>

        {currentView === 'overview' ? (
          <>
            {/* STATS */}
            <div className="stats-grid">
              <div className="stat-card glow-green"><div className="icon-box green"><FaLeaf/></div><div><h3>{dbUser?.donorDetails?.totalMealsDonated || 0}</h3><p>Meals Saved</p></div></div>
              <div className="stat-card glow-gold"><div className="icon-box gold"><FaStar/></div><div><h3>{dbUser?.karmaPoints || 0}</h3><p>Karma</p></div></div>
              <div className="stat-card glow-purple"><div className="icon-box purple"><FaMedal/></div><div><h3>{dbUser?.donorDetails?.donorBadge || 'Bronze'}</h3><p>Level</p></div></div>
            </div>

            {/* ACTIVE TRACKER */}
            {activeDonation && (
              <div className="active-tracker-card slide-up">
                <div className="tracker-header">
                   <h3><span className="pulse-dot"></span> Donation #{activeDonation.id.slice(0,5)}</h3>
                   <button className="donate-btn-mini" style={{width:'auto', padding:'8px 20px'}} onClick={() => setShowChat(!showChat)}>
                     {showChat ? 'Close Chat' : 'Open Chat'} <FaCommentDots/>
                   </button>
                </div>
                
                <div className="progress-track">
                   <div className="step completed"><div className="step-dot"><FaCheckCircle/></div><p>Sent</p></div>
                   <div className={`step ${activeDonation.status!=='pending'?'completed':'active'}`}><div className="step-dot"><FaUserCircle/></div><p>Accepted</p></div>
                   <div className={`step ${activeDonation.status==='picked_up'?'completed':''}`}><div className="step-dot"><FaTruck/></div><p>Pickup</p></div>
                </div>

                {/* CHAT WINDOW */}
                {showChat && (
                  <div className="chat-window slide-up">
                     <div className="chat-header"><span>{activeDonation.targetNgoName || 'Volunteer'} Chat</span><FaTimes onClick={()=>setShowChat(false)} style={{cursor:'pointer'}}/></div>
                     <div className="chat-messages">
                        {chatMessages.length === 0 && (
                          <div style={{textAlign:'center', padding:'20px', color:'#666', fontSize:'0.8rem'}}>
                            {activeDonation.status === 'pending' 
                              ? "Waiting for an NGO to accept. You can leave a message for them now." 
                              : "Start the conversation!"}
                          </div>
                        )}
                        {chatMessages.map((m,i)=><div key={i} className={`chat-bubble ${m.sender==='donor'?'mine':'theirs'}`}>{m.text}</div>)}
                     </div>
                     <form className="chat-input-area" onSubmit={sendMessage}>
                        <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} placeholder="Type a message..." />
                        <button className="chat-send-btn"><FaPaperPlane size={14}/></button>
                     </form>
                  </div>
                )}
              </div>
            )}

            {/* MAP SECTION */}
            <div className="map-section slide-up">
              <div className="map-header-bar">
                <div><h3 style={{margin:0}}>Find & Donate</h3></div>
                <button className="general-donate-btn" onClick={() => handleDonateOpen(null)}><FaPlus /> Random Donation</button>
              </div>
              <div className="map-container-wrapper">
                {!isMapReady ? (
                  <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%', color:'#666'}}>
                    <p>Acquiring GPS Location...</p>
                  </div>
                ) : (
                  <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                    <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
                    
                    {/* User */}
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}><Popup>You are here</Popup></Marker>
                    
                    {/* NGOs */}
                    {nearbyNGOs.map(ngo => (
                      <Marker key={ngo.id} position={[ngo.simLat, ngo.simLng]} icon={greenIcon}>
                        <Popup>
                          <strong>{ngo.name}</strong><br/>
                          <button onClick={()=>handleDonateOpen(ngo)} style={{marginTop:'5px', background:'#00e599', border:'none', borderRadius:'4px', cursor:'pointer', padding:'5px'}}>Donate</button>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>
          </>
        ) : (
          /* HISTORY VIEW */
          <div className="history-list fade-in">
             {pastDonations.map(d => (
                <div key={d.id} className="history-item">
                   <div>
                      <h4>{d.foodItem} ({d.quantity})</h4>
                      <p style={{color:'#666', fontSize:'0.9rem'}}>{new Date(d.createdAt?.seconds*1000).toLocaleDateString()} • {d.status}</p>
                   </div>
                   <div className={`status-badge ${d.status==='picked_up'?'delivered':''}`}>{d.status.replace('_', ' ')}</div>
                </div>
             ))}
             {pastDonations.length===0 && <p style={{color:'#666'}}>No history yet.</p>}
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="right-sidebar">
        <h3><FaMapMarkerAlt /> Nearby NGOs</h3>
        {filteredNGOs.length === 0 ? <p style={{color:'#666'}}>Scanning area...</p> : filteredNGOs.map(ngo => (
          <div key={ngo.id} className="ngo-card" onClick={() => handleDonateOpen(ngo)}>
            <div className="distance-tag">{ngo.distance} km</div>
            <h4>{ngo.name}</h4>
            <p><FaBuilding size={10}/> {ngo.email.split('@')[0]}</p>
            <button className="donate-btn-mini">Donate Directly</button>
          </div>
        ))}
      </aside>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay fade-in">
          <div className="modal-content">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
              <h2>{formData.targetNgoName ? `Donate to ${formData.targetNgoName}` : 'Random Donation'}</h2>
              <FaTimes onClick={()=>setShowModal(false)} style={{cursor:'pointer'}}/>
            </div>
            <form onSubmit={handleDonateSubmit}>
               <div style={{marginBottom:'10px'}}><label style={{color:'#888', fontSize:'0.9rem'}}>Food Item</label><input className="styled-input" required value={formData.foodItem} onChange={e=>setFormData({...formData, foodItem:e.target.value})}/></div>
               <div style={{marginBottom:'10px'}}><label style={{color:'#888', fontSize:'0.9rem'}}>Quantity</label><input className="styled-input" required value={formData.quantity} onChange={e=>setFormData({...formData, quantity:e.target.value})}/></div>
               <div style={{marginBottom:'10px'}}><label style={{color:'#888', fontSize:'0.9rem'}}>Pickup Address</label><input className="styled-input" required value={formData.pickupAddress} onChange={e=>setFormData({...formData, pickupAddress:e.target.value})}/></div>
               <button className="auth-btn" disabled={loading}>{loading?'Processing...':'Confirm Donation'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;