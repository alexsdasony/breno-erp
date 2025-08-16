import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useProducts = () => {
  const addProduct = async (product) => {
    try {
      const response = await apiService.createProduct(product);
      toast({ title: "Produto adicionado!", description: "Novo produto foi cadastrado no estoque." });
      return response.product;
    } catch (error) {
      console.error('Add product error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar produto. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await apiService.updateProduct(id, productData);
      toast({ title: "Produto atualizado!" });
      return response.product;
    } catch (error) {
      console.error('Update product error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar produto. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiService.deleteProduct(id);
      toast({ title: "Produto excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete product error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir produto. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct
  };
};
