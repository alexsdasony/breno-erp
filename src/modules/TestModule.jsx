import React from 'react';
import { motion } from 'framer-motion';

const TestModule = ({ toast }) => {
  console.log('🧪 TestModule - Componente montado com sucesso!');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Módulo de Teste
          </h1>
          <p className="text-muted-foreground mt-2">Este é um módulo de teste para verificar o lazy loading</p>
        </div>
      </div>

      <div className="glass-effect rounded-xl p-6 border">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Lazy Loading Funcionando!</h2>
          <p className="text-gray-400 mb-4">
            Se você está vendo esta página, o lazy loading está funcionando corretamente.
          </p>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 font-medium">
              ✅ Módulo carregado dinamicamente
            </p>
            <p className="text-green-400 text-sm">
              Timestamp: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestModule;
