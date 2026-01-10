import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { FaBoxOpen, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import './Dashboard.css';

const OrderStatus = ({ userId }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Listen for the most recent incomplete order
    const q = query(
      collection(db, "donations"),
      where("donorId", "==", userId),
      where("status", "!=", "completed"), // Only active orders
      orderBy("status"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveOrder({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setActiveOrder(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading || !activeOrder) return null; // Hide if no active order

  // Status Logic
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { icon: <FaClock />, text: "Waiting for NGO", color: "#FFB300" };
      case 'accepted': return { icon: <FaTruck />, text: "Pickup Scheduled", color: "#00e599" };
      case 'picked_up': return { icon: <FaBoxOpen />, text: "Out for Delivery", color: "#2196F3" };
      default: return { icon: <FaCheckCircle />, text: "Processing", color: "#888" };
    }
  };

  const info = getStatusInfo(activeOrder.status);

  return (
    <div className="status-tracker animate-enter">
      <div>
        <h4 style={{ color: 'white', marginBottom: '5px', fontSize: '1.1rem' }}>Active Donation</h4>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          {activeOrder.foodItem} ({activeOrder.quantity})
        </p>
      </div>
      
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: `rgba(${info.color === '#00e599' ? '0,229,153' : '255,179,0'}, 0.1)`,
          color: info.color,
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {info.icon} {info.text}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;