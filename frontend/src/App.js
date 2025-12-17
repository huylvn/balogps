import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChildDetail from './pages/ChildDetail';
import AddChild from './pages/AddChild';
import AddZone from './pages/AddZone';
import TrackerSetup from './pages/TrackerSetup';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      Đang tải...
    </div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      Đang tải...
    </div>;
  }

  return !user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/add-child" element={
            <PrivateRoute>
              <AddChild />
            </PrivateRoute>
          } />
          
          <Route path="/child/:childId" element={
            <PrivateRoute>
              <ChildDetail />
            </PrivateRoute>
          } />
          
          <Route path="/child/:childId/add-zone" element={
            <PrivateRoute>
              <AddZone />
            </PrivateRoute>
          } />

          <Route path="/child/:childId/tracker" element={
            <PrivateRoute>
              <TrackerSetup />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
