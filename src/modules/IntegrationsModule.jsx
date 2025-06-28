import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings, CheckCircle, XCircle, ExternalLink, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; 
import { Label } from '@/components/ui/label';

const IntegrationsModule = ({ data, updateIntegrationSettings, toast }) => {
  const [imobziApiKey, setImobziApiKey] = useState('');
  const [imobziEnabled, setImobziEnabled] = useState(false);

  useEffect(() => {
    if (data.integrations && data.integrations.imobzi) {
      setImobziApiKey(data.integrations.imobzi.apiKey || '');
      setImobziEnabled(data.integrations.imobzi.enabled || false);
    }
  }, [data.integrations]);

  const handleSaveImobziSettings = () => {
    updateIntegrationSettings('imobzi', { apiKey: imobziApiKey, enabled: imobziEnabled });
    toast({
      title: "Configurações Salvas!",
      description: "As configurações da integração Imobzi foram atualizadas."
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Gerenciador de Integrações
          </h1>
          <p className="text-muted-foreground mt-2">Conecte seu ERP com outros sistemas</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Zap className="w-6 h-6 mr-3 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold">Imobzi API</h3>
              <p className="text-sm text-muted-foreground">Integração com o sistema Imobzi para gestão imobiliária.</p>
            </div>
          </div>
          <a 
            href="https://imobzi.com/api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
          >
            Documentação da API <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="imobzi-apikey" className="text-sm font-medium">API Key da Imobzi</Label>
            <input
              id="imobzi-apikey"
              type="password"
              value={imobziApiKey}
              onChange={(e) => setImobziApiKey(e.target.value)}
              className="w-full mt-1 p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Cole sua API Key aqui"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="imobzi-enabled"
              checked={imobziEnabled}
              onCheckedChange={setImobziEnabled}
            />
            <Label htmlFor="imobzi-enabled">Ativar Integração Imobzi</Label>
          </div>
          
          <div className="flex items-center pt-2">
            {imobziEnabled && imobziApiKey ? (
              <span className="text-sm text-green-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" /> Integração Ativa e Configurada (Simulado)
              </span>
            ) : imobziEnabled && !imobziApiKey ? (
              <span className="text-sm text-yellow-400 flex items-center">
                <XCircle className="w-4 h-4 mr-2" /> Integração Ativa, mas API Key não fornecida.
              </span>
            ) : (
               <span className="text-sm text-muted-foreground flex items-center">
                <XCircle className="w-4 h-4 mr-2" /> Integração Desativada.
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveImobziSettings} className="bg-gradient-to-r from-yellow-500 to-orange-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações Imobzi
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Nota: A funcionalidade real de integração (sincronização de dados, etc.) precisaria ser implementada utilizando a API Key fornecida para se comunicar com os endpoints da Imobzi.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6 border opacity-50 cursor-not-allowed" 
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Settings className="w-6 h-6 mr-3 text-gray-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-500">Outra Integração (Exemplo)</h3>
              <p className="text-sm text-muted-foreground">Configurações para outra API ou serviço.</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Mais integrações podem ser adicionadas aqui no futuro.</p>
      </motion.div>

    </motion.div>
  );
};

export default IntegrationsModule;