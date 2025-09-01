import React from 'react';
import { Label } from '@/components/ui/label';
import { CustomerTabProps, STATUS_OPTIONS } from '../../../../../src/types/CustomerForm';

export const SystemTab: React.FC<CustomerTabProps> = ({ data, onChange }) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Informações do Sistema</h2>
        <p className="text-sm text-muted-foreground">Status, responsável e dados de controle interno</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status do Cliente</Label>
          <select
            id="status"
            value={data.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsavel_cadastro">Responsável pelo Cadastro</Label>
          <input
            id="responsavel_cadastro"
            type="text"
            value={data.responsavel_cadastro || ''}
            onChange={(e) => handleInputChange('responsavel_cadastro', e.target.value)}
            className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            placeholder="Nome do responsável"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_cadastro">Data de Cadastro</Label>
          <input
            id="data_cadastro"
            type="date"
            value={data.data_cadastro || ''}
            onChange={(e) => handleInputChange('data_cadastro', e.target.value)}
            className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label>Status Visual</Label>
          <div className="flex items-center space-x-4 pt-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                data.status === 'ativo' ? 'bg-green-500' :
                data.status === 'inativo' ? 'bg-gray-500' :
                data.status === 'suspenso' ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-sm font-medium">
                {STATUS_OPTIONS.find(opt => opt.value === data.status)?.label || 'Indefinido'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações Gerais</Label>
        <textarea
          id="observacoes"
          value={data.observacoes || ''}
          onChange={(e) => handleInputChange('observacoes', e.target.value)}
          rows={6}
          className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          placeholder="Digite observações gerais sobre o cliente..."
        />
      </div>

      {/* Informações do Sistema */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Informações do Sistema</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Data de Criação:</span>
            <p className="text-gray-600">{formatDate(data.data_cadastro) || 'Não informado'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Responsável:</span>
            <p className="text-gray-600">{data.responsavel_cadastro || 'Não informado'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status Atual:</span>
            <p className="text-gray-600">
              {STATUS_OPTIONS.find(opt => opt.value === data.status)?.label || 'Indefinido'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Última Atualização:</span>
            <p className="text-gray-600">Agora</p>
          </div>
        </div>
      </div>

      {/* Alertas e Avisos */}
      {data.status === 'suspenso' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-red-800 font-medium">Cliente Suspenso</h4>
              <p className="text-red-700 text-sm mt-1">
                Este cliente está com status suspenso. Verifique as observações e tome as ações necessárias.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.status === 'inativo' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-yellow-800 font-medium">Cliente Inativo</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Este cliente está inativo no sistema. Considere reativar se necessário.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};