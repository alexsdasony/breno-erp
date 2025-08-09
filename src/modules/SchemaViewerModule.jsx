import React from 'react';
import { motion } from 'framer-motion';
import { Database, Table, Type, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const SchemaViewerModule = ({ data }) => {
  const [remoteData, setRemoteData] = React.useState(null);
  const effectiveData = remoteData || data || {};

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Tenta buscar schema consolidado do backend
        // Esperado: JSON com chaves equivalentes às usadas no viewer (transactions, products, etc.)
        const resp = await apiService.getDatabaseSchema();
        if (mounted && resp && typeof resp === 'object') {
          setRemoteData(resp);
        }
      } catch (err) {
        // Fallback silencioso: mantém "data" recebido por props
        console.warn('SchemaViewer: fallback para data de props. Motivo:', err?.message || err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getFieldType = (value) => {
    if (typeof value === 'string') return 'TEXTO';
    if (typeof value === 'number') return 'NÚMERO';
    if (typeof value === 'boolean') return 'BOOLEANO';
    if (Array.isArray(value)) return 'LISTA';
    if (typeof value === 'object' && value !== null) return 'OBJETO';
    return 'DESCONHECIDO';
  };

  const generateSchema = () => {
    const schema = {};
    Object.keys(effectiveData).forEach(key => {
      if (Array.isArray(effectiveData[key]) && effectiveData[key].length > 0) {
        const sampleItem = effectiveData[key][0];
        schema[key] = {
          type: 'LISTA',
          itemSchema: Object.fromEntries(
            Object.entries(sampleItem).map(([field, value]) => [field, getFieldType(value)])
          )
        };
      } else if (typeof effectiveData[key] === 'object' && effectiveData[key] !== null) {
        schema[key] = {
          type: 'OBJETO',
          properties: Object.fromEntries(
            Object.entries(effectiveData[key]).map(([field, value]) => [field, getFieldType(value)])
          )
        };
         // Handle nested objects within integrations for example
        if (key === 'integrations') {
          Object.keys(effectiveData[key]).forEach(subKey => {
            if (typeof effectiveData[key][subKey] === 'object' && effectiveData[key][subKey] !== null) {
              schema[key].properties[subKey] = {
                type: 'OBJETO',
                properties: Object.fromEntries(
                  Object.entries(effectiveData[key][subKey]).map(([field, value]) => [field, getFieldType(value)])
                )
              }
            }
          });
        }
      } else {
         schema[key] = getFieldType(effectiveData[key]);
      }
    });
    return schema;
  };

  const handleDownloadSchema = () => {
    try {
      const schemaData = generateSchema();
      const jsonString = JSON.stringify(schemaData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "erp_schema.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Schema Baixado!",
        description: "O arquivo JSON do schema foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao baixar schema:", error);
      toast({
        title: "Erro ao Baixar",
        description: "Não foi possível gerar ou baixar o arquivo do schema.",
        variant: "destructive",
      });
    }
  };


  const renderSchemaForEntity = (entityName, entityArray) => {
    if (!entityArray || entityArray.length === 0) {
      return <p className="text-muted-foreground">Nenhum dado de exemplo para "{entityName}".</p>;
    }
    
    const sampleItem = entityArray[0];
    const fields = Object.keys(sampleItem);

    return (
      <motion.div 
        className="glass-effect rounded-xl p-6 border mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <Table className="w-6 h-6 mr-3 text-blue-400" />
          <h2 className="text-xl font-semibold text-blue-300">{entityName.charAt(0).toUpperCase() + entityName.slice(1)}</h2>
        </div>
        <ul className="space-y-2">
          {fields.map(field => (
            <li key={field} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md">
              <span className="font-medium text-slate-300">{field}</span>
              <div className="flex items-center px-2 py-1 text-xs bg-slate-700 text-purple-400 rounded-full">
                <Type className="w-3 h-3 mr-1" />
                {getFieldType(sampleItem[field])}
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  };
  
  const renderSchemaForObject = (objectName, objectData) => {
    if (!objectData || typeof objectData !== 'object' || Object.keys(objectData).length === 0) {
      return <p className="text-muted-foreground">Nenhum dado para "{objectName}".</p>;
    }

    return (
      <motion.div 
        className="glass-effect rounded-xl p-6 border mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <Table className="w-6 h-6 mr-3 text-green-400" />
          <h2 className="text-xl font-semibold text-green-300">{objectName.charAt(0).toUpperCase() + objectName.slice(1)}</h2>
        </div>
        <ul className="space-y-2">
          {Object.entries(objectData).map(([key, value]) => (
            <li key={key} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md">
              <span className="font-medium text-slate-300">{key}</span>
              {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                 <span className="text-xs text-purple-400">(Veja sub-objeto abaixo)</span>
              ) : (
                <div className="flex items-center px-2 py-1 text-xs bg-slate-700 text-purple-400 rounded-full">
                  <Type className="w-3 h-3 mr-1" />
                  {getFieldType(value)}
                </div>
              )}
            </li>
          ))}
          {Object.entries(objectData).map(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              return (
                <li key={`${key}-sub`} className="ml-4 mt-2">
                  {renderSchemaForObject(key, value)}
                </li>
              );
            }
            return null;
          })}
        </ul>
      </motion.div>
    );
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
            <Database className="w-6 h-6 mr-2" />
            Schema do Banco de Dados (PostgreSQL)
          </h2>
          <p className="text-gray-400 mb-6">
            Esta é uma representação da estrutura de dados do banco PostgreSQL em produção.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Button onClick={handleDownloadSchema} className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
            <Download className="w-4 h-4 mr-2" />
            Baixar Schema (JSON)
          </Button>
        </div>
      </div>

      {renderSchemaForEntity("transactions", effectiveData.transactions)}
      {renderSchemaForEntity("products", effectiveData.products)}
      {renderSchemaForEntity("sales", effectiveData.sales)}
      {renderSchemaForEntity("customers", effectiveData.customers)}
      {renderSchemaForEntity("costCenters", effectiveData.costCenters)}
      {renderSchemaForEntity("nfeList", effectiveData.nfeList)}
      {renderSchemaForEntity("billings", effectiveData.billings)}
      {renderSchemaForObject("integrations", effectiveData.integrations)}

    </motion.div>
  );
};

export default SchemaViewerModule;