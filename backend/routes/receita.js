import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// Consulta simulada da Receita Federal
const consultarReceita = async (cpf) => {
  // Simulação de consulta - substituir por API real
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Dados mock para demonstração
  const dadosMock = {
    cpf: cpfLimpo,
    nome: 'João Silva Santos',
    dataNascimento: '1985-03-15',
    situacaoCadastral: 'REGULAR',
    dataInscricao: '2000-01-01',
    dataObito: null,
    pendenciasFiscais: [],
    restricoes: [],
    endereco: {
      logradouro: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234-567'
    },
    ultimaAtualizacao: new Date().toISOString()
  };

  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return dadosMock;
};

// Rota para consultar CPF na Receita Federal
router.get('/consulta/:cpf', authenticateToken, async (req, res) => {
  try {
    const { cpf } = req.params;
    console.log('🔔 [Receita] Requisição recebida para CPF:', cpf);
    console.log('🔔 [Receita] Headers:', req.headers);
    
    // Validação básica do CPF
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      console.log('❌ [Receita] CPF inválido:', cpf);
      return res.status(400).json({ 
        error: 'CPF inválido. Deve conter 11 dígitos.' 
      });
    }

    console.log(`🔍 Consultando Receita Federal para CPF: ${cpf}`);
    
    const dados = await consultarReceita(cpf);
    
    console.log(`✅ Consulta Receita Federal concluída para CPF: ${cpf}`);
    
    res.json({
      success: true,
      data: dados,
      message: 'Consulta realizada com sucesso'
    });

  } catch (error) {
    console.error(`❌ Erro na consulta Receita Federal:`, error);
    res.status(500).json({ 
      error: 'Erro ao consultar Receita Federal',
      details: error.message 
    });
  }
});

// Rota para consultar CNPJ na Receita Federal (dados reais via BrasilAPI)
router.get('/consulta-cnpj/:cnpj', authenticateToken, async (req, res) => {
  const { cnpj } = req.params;
  if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
    return res.status(400).json({ success: false, data: null, message: 'CNPJ inválido. Deve conter 14 dígitos.' });
  }
  try {
    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(404).json({ success: false, data: null, message: 'CNPJ não encontrado na base da Receita Federal.' });
    }
    const data = await response.json();
    return res.json({ success: true, data, message: 'Consulta realizada com sucesso' });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, message: 'Erro ao consultar CNPJ na Receita Federal.' });
  }
});

export default router; 