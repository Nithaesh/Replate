import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FaCheck, FaTimes, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Users
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching users from Firestore..."); // DEBUG LOG
        const querySnapshot = await getDocs(collection(db, "users"));
        
        const allUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Raw Data from DB:", allUsers); // DEBUG LOG: Check this in Console!

        setUsers(allUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error); // Check for "Missing Permissions" error here
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (userId) => {
    if(!window.confirm("Approve NGO?")) return;
    await updateDoc(doc(db, "users", userId), { status: 'active' });
    setUsers(prev => prev.map(u => u.uid === userId ? {...u, status: 'active'} : u));
  };

  const handleReject = async (userId) => {
    if(!window.confirm("Reject NGO?")) return;
    await updateDoc(doc(db, "users", userId), { status: 'rejected' });
    setUsers(prev => prev.map(u => u.uid === userId ? {...u, status: 'rejected'} : u));
  };

  // Filter Logic
  const pendingNGOs = users.filter(u => u.role === 'institutional_receiver' && u.status === 'pending');

  if (loading) return <div style={{padding:'50px', color:'white'}}>Loading data...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '2rem' }}>
        <h1 style={{borderBottom:'1px solid #333', paddingBottom:'1rem'}}>Admin Console</h1>
        
        {/* DEBUG SECTION - REMOVE LATER */}
        <div style={{background:'#222', padding:'10px', marginBottom:'20px', fontSize:'0.8rem', color:'#aaa'}}>
          <strong>Debug Stats:</strong><br/>
          Total Users Found: {users.length}<br/>
          Pending NGOs Found: {pendingNGOs.length}
        </div>

        <h2 style={{color:'#f59e0b'}}>Pending Approvals</h2>
        
        {pendingNGOs.length === 0 ? (
           <div style={{padding:'2rem', border:'1px dashed #444', borderRadius:'10px', textAlign:'center', color:'#666'}}>
             No pending requests found.<br/>
             (Check the console F12 to see if data is being blocked)
           </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {pendingNGOs.map((ngo) => (
              <div key={ngo.id} style={{ background: '#161616', border: '1px solid #333', borderRadius: '15px', padding: '1.5rem' }}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                   <FaBuilding style={{color:'#00e599'}}/>
                   <h3 style={{margin:0}}>{ngo.name}</h3>
                </div>
                
                <p style={{color:'#888', fontSize:'0.9rem'}}>Email: {ngo.email}</p>
                <p style={{color:'#888', fontSize:'0.9rem'}}>Reg ID: {ngo.receiverDetails?.registrationId || 'N/A'}</p>

                <div style={{ display: 'flex', gap: '10px', marginTop:'1.5rem' }}>
                  <button onClick={() => handleApprove(ngo.id)} style={{ flex: 1, background: '#00e599', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' }}>
                     Approve
                  </button>
                  <button onClick={() => handleReject(ngo.id)} style={{ flex: 1, background: 'transparent', border:'1px solid #f43f5e', color:'#f43f5e', padding:'10px', borderRadius:'5px', cursor:'pointer' }}>
                     Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;