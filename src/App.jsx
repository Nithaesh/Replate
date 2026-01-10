import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Components
import LandingPage from './components/Home/LandingPage';
import AuthSelection from './components/Auth/AuthSelection';
import Login from './components/Auth/Login';
import EmailLogin from './components/Auth/EmailLogin';
import ForgotPassword from './components/Auth/ForgotPassword';
import NGORegister from './components/Auth/NGORegister'; // The new file we will create below

// Dashboard Components
import DonorDashboard from './components/Dashboard/DonorDashboard';
import NGODashboard from './components/Admin/NGODashboard'; // This is the NGO Command Center
import AdminDashboard from './components/Admin/AdminDashboard'; // This is the Super Admin Panel

// --- PROTECTED ROUTE COMPONENT ---
// This ensures only the right roles can access specific pages
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, dbUser, loading } = useAuth();
  
  if (loading) return <div style={{height:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;
  
  if (!user || !dbUser) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(dbUser.role)) {
    // Redirect unauthorized users based on their actual role
    if (dbUser.role === 'individual_donor') return <Navigate to="/dashboard/donor" />;
    if (dbUser.role === 'institutional_receiver') return <Navigate to="/dashboard/ngo" />;
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<AuthSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-email" element={<EmailLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* NGO Registration (The one we are fixing next) */}
          <Route path="/auth/receiver" element={<NGORegister />} />

          {/* Protected Routes */}
          <Route path="/dashboard/donor" element={
            <ProtectedRoute allowedRoles={['individual_donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/ngo" element={
            <ProtectedRoute allowedRoles={['institutional_receiver']}>
              <NGODashboard />
            </ProtectedRoute>
          } />

          {/* SUPER ADMIN ROUTE (Fixed) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch-All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;