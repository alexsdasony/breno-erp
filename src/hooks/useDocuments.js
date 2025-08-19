import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useDocuments = () => {
  const addNFe = async (nfe) => {
    try {
      const response = await apiService.createNFe(nfe);
      toast({ title: "NF-e Gerada!", description: "Nova NF-e foi adicionada à lista." });
      return response.nfe;
    } catch (error) {
      console.error('Add NFe error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao criar NF-e. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateNFe = async (id, nfeData) => {
    try {
      const response = await apiService.updateNFe(id, nfeData);
      toast({ title: "NF-e atualizada!" });
      return response.nfe;
    } catch (error) {
      console.error('Update NFe error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar NF-e. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteNFe = async (id) => {
    try {
      await apiService.deleteNFe(id);
      toast({ title: "NF-e excluída!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete NFe error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir NF-e. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  return {
    addNFe,
    updateNFe,
    deleteNFe
  };
};
