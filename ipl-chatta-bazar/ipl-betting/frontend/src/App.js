import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#f59e0b',fontSize:'20px',fontFamily:'Rajdhani'}}>⚡ Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute role="USER"><UserDashboard /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            style: { background: '#111827', color: '#f3f4f6', border: '1px solid #1f2d45' },
            success: { style: { borderColor: '#10b981' } },
            error: { style: { borderColor: '#ef4444' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
