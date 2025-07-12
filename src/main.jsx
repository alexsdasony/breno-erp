import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AppDataProvider } from '@/hooks/useAppData.jsx';

console.log('🚀 main.jsx - Iniciando aplicação React');

const root = ReactDOM.createRoot(document.getElementById('root'));

console.log('🔧 main.jsx - Root element encontrado:', !!document.getElementById('root'));

root.render(
  <AppDataProvider>
    <App />
  </AppDataProvider>
);

console.log('✅ main.jsx - Aplicação React renderizada');
