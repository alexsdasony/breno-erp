import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export const useFornecedores = ({ segmentId = null, status = 'all', search = '' } = {}) => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar fornecedores
  const fetchFornecedores = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (segmentId && segmentId !== '0') params.append('segmentId', segmentId);
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const response = await apiService.get(`/fornecedores?${params.toString()}`);
      setFornecedores(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
      setError('Erro ao carregar fornecedores');
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  };

  // Criar fornecedor
  const create = async (fornecedorData) => {
    try {
      setLoading(true);
      const response = await apiService.post('/fornecedores', fornecedorData);
      await fetchFornecedores(); // Recarregar lista
      return response.data;
    } catch (err) {
      console.error('Erro ao criar fornecedor:', err);
      throw new Error(err.response?.data?.error || 'Erro ao criar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar fornecedor
  const update = async (id, fornecedorData) => {
    try {
      setLoading(true);
      const response = await apiService.put(`/fornecedores/${id}`, fornecedorData);
      await fetchFornecedores(); // Recarregar lista
      return response.data;
    } catch (err) {
      console.error('Erro ao atualizar fornecedor:', err);
      throw new Error(err.response?.data?.error || 'Erro ao atualizar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  // Excluir fornecedor
  const remove = async (id) => {
    try {
      setLoading(true);
      await apiService.delete(`/fornecedores/${id}`);
      await fetchFornecedores(); // Recarregar lista
    } catch (err) {
      console.error('Erro ao excluir fornecedor:', err);
      throw new Error(err.response?.data?.error || 'Erro ao excluir fornecedor');
    } finally {
      setLoading(false);
    }
  };

  // Buscar fornecedor por ID
  const getById = async (id) => {
    try {
      const response = await apiService.get(`/fornecedores/${id}`);
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar fornecedor:', err);
      throw new Error(err.response?.data?.error || 'Erro ao buscar fornecedor');
    }
  };

  // Carregar dados quando segmentId, status ou search mudarem
  useEffect(() => {
    fetchFornecedores();
  }, [segmentId, status, search]);

  return {
    fornecedores,
    loading,
    error,
    create,
    update,
    remove,
    getById,
    refetch: fetchFornecedores
  };
};
