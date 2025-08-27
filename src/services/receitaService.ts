import apiService from './api';

// Importando o tipo ApiResponse do arquivo api.ts
import type { ApiResponse } from './api';

/**
 * Interface para os dados retornados pela consulta de CPF na Receita Federal
 */
export interface ReceitaCPFResponse {
  nome?: string;
  situacao?: string;
  cpf?: string;
  [key: string]: any; // Outros campos que podem ser retornados
}

/**
 * Interface para os dados retornados pela consulta de CNPJ na Receita Federal
 */
export interface ReceitaCNPJResponse {
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  situacao?: string;
  endereco?: string;
  [key: string]: any; // Outros campos que podem ser retornados
}

/**
 * Consulta dados de pessoa física (CPF) na Receita Federal
 * @param cpf CPF a ser consultado (apenas números)
 * @returns Dados da pessoa física
 */
export async function consultarCPF(cpf: string): Promise<ApiResponse<ReceitaCPFResponse>> {
  const response = await apiService.get<ApiResponse<ReceitaCPFResponse>>(`/receita/cpf/${cpf}`);
  return response;
}

/**
 * Consulta dados de pessoa jurídica (CNPJ) na Receita Federal
 * @param cnpj CNPJ a ser consultado (apenas números)
 * @returns Dados da pessoa jurídica
 */
export async function consultarCNPJ(cnpj: string): Promise<ApiResponse<ReceitaCNPJResponse>> {
  const response = await apiService.get<ApiResponse<ReceitaCNPJResponse>>(`/receita/cnpj/${cnpj}`);
  return response;
}

// Exportação padrão do serviço
const receitaService = {
  consultarCPF,
  consultarCNPJ
};

export default receitaService;