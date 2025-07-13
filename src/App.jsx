import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAppData } from '@/hooks/useAppData.jsx';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ErpLayout from '@/components/layouts/ErpLayout'; 

// Componente de teste simples
const TestPage = () => {
  console.log('🧪 TestPage renderizada');
  return (
    <div style={{ 
      padding: '20px', 
      background: 'blue', 
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>Página de Teste</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
    </div>
  );
};

// Componente de teste sem useAppData
const SimpleApp = () => {
  console.log('🧪 SimpleApp renderizado');
  return (
    <div style={{ 
      padding: '20px', 
      background: 'green', 
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>App Simples</h1>
      <p>Teste sem useAppData</p>
    </div>
  );
};

const App = () => {
  try {
    const { currentUser } = useAppData();
    console.log('🔍 App.jsx - currentUser:', currentUser);

    return (
      <>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/simple" element={<SimpleApp />} />
            <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!currentUser ? <ForgotPasswordPage /> : <Navigate to="/" />} />
            <Route path="/reset-password" element={!currentUser ? <ResetPasswordPage /> : <Navigate to="/" />} />
            <Route 
              path="/*" 
              element={currentUser ? <ErpLayout /> : <Navigate to="/login" />} 
            />
          </Routes>
          <Toaster />
        </Router>
      </>
    );
  } catch (error) {
    console.error('❌ Erro no App.jsx:', error);
    return <SimpleApp />;
  }
};

export default App;
