import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

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
    
    // Validação básica do CPF
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
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

// Rota para consultar CNPJ na Receita Federal
router.get('/consulta-cnpj/:cnpj', authenticateToken, async (req, res) => {
  try {
    const { cnpj } = req.params;
    
    // Validação básica do CNPJ
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      return res.status(400).json({ 
        error: 'CNPJ inválido. Deve conter 14 dígitos.' 
      });
    }

    console.log(`🔍 Consultando Receita Federal para CNPJ: ${cnpj}`);
    
    // Simulação de consulta CNPJ
    const dadosMock = {
      cnpj: cnpj.replace(/\D/g, ''),
      razaoSocial: 'EMPRESA EXEMPLO LTDA',
      nomeFantasia: 'EMPRESA EXEMPLO',
      dataAbertura: '2010-01-01',
      situacaoCadastral: 'ATIVA',
      tipoEmpresa: 'LTDA',
      capitalSocial: 100000.00,
      pendenciasFiscais: [],
      endereco: {
        logradouro: 'Av. Paulista, 1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01310-100'
      },
      ultimaAtualizacao: new Date().toISOString()
    };

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Consulta Receita Federal CNPJ concluída para: ${cnpj}`);
    
    res.json({
      success: true,
      data: dadosMock,
      message: 'Consulta realizada com sucesso'
    });

  } catch (error) {
    console.error(`❌ Erro na consulta Receita Federal CNPJ:`, error);
    res.status(500).json({ 
      error: 'Erro ao consultar Receita Federal',
      details: error.message 
    });
  }
});

export default router; 