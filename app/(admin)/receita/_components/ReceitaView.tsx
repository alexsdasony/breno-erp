'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import apiService from '@/services/api';

export default function ReceitaView() {
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const consultarCPF = async () => {
    setLoading(true);
    try {
      const res = await apiService.consultarReceita(cpf);
      setResult((res as any).data || res);
    } catch (e) {
      setResult({ error: 'Falha na consulta CPF' });
    } finally {
      setLoading(false);
    }
  };

  const consultarCNPJ = async () => {
    setLoading(true);
    try {
      const res = await apiService.consultarReceitaCNPJ(cnpj);
      setResult((res as any).data || res);
    } catch (e) {
      setResult({ error: 'Falha na consulta CNPJ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Consulta Receita</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="text-sm text-gray-400">Consultar CPF</div>
          <input
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite o CPF"
            className="w-full rounded bg-transparent border border-white/10 px-3 py-2"
          />
          <Button onClick={consultarCPF} disabled={loading || !cpf}>Consultar CPF</Button>
        </div>

        <div className="rounded-md border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="text-sm text-gray-400">Consultar CNPJ</div>
          <input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Digite o CNPJ"
            className="w-full rounded bg-transparent border border-white/10 px-3 py-2"
          />
          <Button onClick={consultarCNPJ} disabled={loading || !cnpj}>Consultar CNPJ</Button>
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-gray-400 mb-2">Resultado</div>
        <pre className="text-xs whitespace-pre-wrap break-words">{result ? JSON.stringify(result, null, 2) : 'Sem resultado.'}</pre>
      </div>
    </div>
  );
}
