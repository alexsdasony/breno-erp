import React from 'react';
import { motion } from 'framer-motion';
import { Database, Table, Type, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const SchemaViewerModule = ({ data }) => {

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
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        const sampleItem = data[key][0];
        schema[key] = {
          type: 'LISTA',
          itemSchema: Object.fromEntries(
            Object.entries(sampleItem).map(([field, value]) => [field, getFieldType(value)])
          )
        };
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        schema[key] = {
          type: 'OBJETO',
          properties: Object.fromEntries(
            Object.entries(data[key]).map(([field, value]) => [field, getFieldType(value)])
          )
        };
         // Handle nested objects within integrations for example
        if (key === 'integrations') {
          Object.keys(data[key]).forEach(subKey => {
            if (typeof data[key][subKey] === 'object' && data[key][subKey] !== null) {
              schema[key].properties[subKey] = {
                type: 'OBJETO',
                properties: Object.fromEntries(
                  Object.entries(data[key][subKey]).map(([field, value]) => [field, getFieldType(value)])
                )
              }
            }
          });
        }
      } else {
         schema[key] = getFieldType(data[key]);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Database className="w-8 h-8 mr-3 text-indigo-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Schema do Banco de Dados (localStorage)
          </h1>
        </div>
        <Button onClick={handleDownloadSchema} className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
          <Download className="w-4 h-4 mr-2" />
          Baixar Schema (JSON)
        </Button>
      </div>
      <p className="text-muted-foreground">
        Esta é uma representação da estrutura de dados atualmente armazenada no localStorage.
        Cada seção representa uma "tabela" ou entidade de dados. O botão acima permite baixar
        um arquivo JSON com uma descrição formal deste schema.
      </p>

      {renderSchemaForEntity("transactions", data.transactions)}
      {renderSchemaForEntity("products", data.products)}
      {renderSchemaForEntity("sales", data.sales)}
      {renderSchemaForEntity("customers", data.customers)}
      {renderSchemaForEntity("costCenters", data.costCenters)}
      {renderSchemaForEntity("nfeList", data.nfeList)}
      {renderSchemaForEntity("billings", data.billings)}
      {renderSchemaForObject("integrations", data.integrations)}

    </motion.div>
  );
};

export default SchemaViewerModule;