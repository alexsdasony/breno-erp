import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ImportDataButton = ({ onDataImported, expectedHeaders, moduleName, importAction }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "text/csv") {
        toast({
          title: "Erro de Importação",
          description: "Por favor, selecione um arquivo CSV.",
          variant: "destructive",
        });
        return;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            toast({
              title: "Erro ao Ler CSV",
              description: `Ocorreram erros: ${results.errors.map(e => e.message).join(', ')}`,
              variant: "destructive",
            });
            return;
          }
          
          const headers = results.meta.fields;
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            toast({
              title: "Cabeçalhos Inválidos",
              description: `O arquivo CSV não contém os seguintes cabeçalhos esperados: ${missingHeaders.join(', ')}. Verifique o formato do arquivo.`,
              variant: "destructive",
            });
            return;
          }

          if (results.data.length === 0) {
            toast({
              title: "Arquivo Vazio",
              description: "O arquivo CSV selecionado não contém dados.",
              variant: "destructive",
            });
            return;
          }
          
          try {
            onDataImported(results.data, importAction);
            toast({
              title: "Importação Iniciada",
              description: `${results.data.length} registros de ${moduleName} estão sendo processados.`,
            });
          } catch (error) {
             toast({
              title: "Erro ao Processar Dados",
              description: `Falha ao importar dados: ${error.message}`,
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          toast({
            title: "Erro de Importação",
            description: `Não foi possível ler o arquivo: ${error.message}`,
            variant: "destructive",
          });
        }
      });
      event.target.value = null; 
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: 'none' }}
      />
      <Button onClick={handleClick} variant="outline" size="sm">
        <Upload className="w-4 h-4 mr-2" />
        Importar CSV
      </Button>
    </>
  );
};

export default ImportDataButton;