
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAppData } from '@/hooks/useAppData.jsx';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ErpLayout from '@/components/layouts/ErpLayout'; 

const App = () => {
  const { currentUser } = useAppData();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!currentUser ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        <Route 
          path="/*" 
          element={currentUser ? <ErpLayout /> : <Navigate to="/login" />} 
        />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
