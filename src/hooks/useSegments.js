import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useSegments = () => {
  const addSegment = async (segment) => {
    try {
      const response = await apiService.createSegment(segment);
      toast({ title: "Segmento criado!", description: "Novo segmento foi adicionado com sucesso." });
      return response.segment;
    } catch (error) {
      console.error('Add segment error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao criar segmento. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateSegment = async (id, segmentData) => {
    try {
      const response = await apiService.updateSegment(id, segmentData);
      toast({ title: "Segmento atualizado!" });
      return response.segment;
    } catch (error) {
      console.error('Update segment error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar segmento. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteSegment = async (id) => {
    try {
      await apiService.deleteSegment(id);
      toast({ title: "Segmento Excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete segment error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir segmento. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  return {
    addSegment,
    updateSegment,
    deleteSegment
  };
};
