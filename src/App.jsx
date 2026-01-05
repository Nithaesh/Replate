import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth Components
import LandingPage from './components/Home/LandingPage';
import AuthSelection from './components/Auth/AuthSelection';
import DonorLogin from './components/Auth/DonorLogin';
import NGORegister from './components/Auth/NGORegister';
import Login from './components/Auth/Login';
import VerifyEmail from './components/Auth/VerifyEmail';

// Dashboard Components
import AdminDashboard from './components/Admin/AdminDashboard';
import NGODashboard from './components/Admin/NGODashboard'; 
import DonorDashboard from './components/Dashboard/DonorDashboard'; // ✅ The Real Import

// ❌ DELETED: const DonorDashboard = ... (This caused the error)

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<AuthSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Role-Specific Login/Register */}
          <Route path="/auth/donor" element={<DonorLogin />} />
          <Route path="/auth/receiver" element={<NGORegister />} />

          {/* Dashboards (Protected) */}
          <Route path="/dashboard/donor" element={<DonorDashboard />} />
          <Route path="/dashboard/ngo" element={<NGODashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Catch-all: Redirect unknown URLs to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;