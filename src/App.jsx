import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import MyProfilePage from './pages/MyProfilePage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/archive" 
          element={
            <ProtectedRoute>
              <div>Archive Page - Under Development</div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/" 
          element={<Navigate to="/chat" replace />} 
        />

        <Route 
          path="*" 
          element={<Navigate to="/chat" replace />} 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
