'use client';

import React from 'react';
import { useChartOfAccounts } from '../_hooks/useChartOfAccounts';
import { Button } from '@/components/ui/button';

export default function ChartOfAccountsView() {
  const { items, loading, hasMore, loadMore, create, update, remove } = useChartOfAccounts();
  const [showForm, setShowForm] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | ''>('');

  // Edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editCode, setEditCode] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editType, setEditType] = React.useState<'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | ''>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !type) return;
    await create({ code, name, type });
    setCode('');
    setName('');
    setType('');
    setShowForm(false);
  };

  const startEdit = (acc: { id: string; code?: string | null; name?: string | null; type?: any }) => {
    setEditingId(acc.id);
    setEditCode(acc.code || '');
    setEditName(acc.name || '');
    setEditType((acc.type as any) || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCode('');
    setEditName('');
    setEditType('');
  };

  const onSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editCode || !editName || !editType) return;
    await update(editingId, { code: editCode, name: editName, type: editType });
    cancelEdit();
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Plano de Contas</h1>

      <div className="flex items-center gap-3">
        <Button id="chart-of-accounts-new-button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Novo'}
        </Button>
      </div>

      {showForm && (
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded-md p-4 bg-white/5 border-white/10" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="chartOfAccountsCode" className="text-sm">Código</label>
            <input
              id="chartOfAccountsCode"
              className="px-3 py-2 rounded-md bg-transparent border border-white/10"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="1.1.1"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="chartOfAccountsName" className="text-sm">Nome</label>
            <input
              id="chartOfAccountsName"
              className="px-3 py-2 rounded-md bg-transparent border border-white/10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Caixa"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="chartOfAccountsType" className="text-sm">Tipo</label>
            <select
              id="chartOfAccountsType"
              className="px-3 py-2 rounded-md bg-transparent border border-white/10"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              required
            >
              <option value="" disabled>Selecione</option>
              <option value="asset">Ativo</option>
              <option value="liability">Passivo</option>
              <option value="equity">Patrimônio</option>
              <option value="revenue">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button id="chart-of-accounts-submit-button" type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      )}

      <div className="border rounded-md bg-white/5 border-white/10 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b border-white/10">
              <th className="p-3">Código</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((acc) => (
              <React.Fragment key={acc.id}>
                <tr className="border-b border-white/5">
                  <td className="p-3 align-top">{acc.code || '-'}</td>
                  <td className="p-3 align-top">{acc.name || '-'}</td>
                  <td className="p-3 align-top">{acc.type || '-'}</td>
                  <td className="p-3 align-top text-right space-x-2">
                    <button
                      type="button"
                      title="Editar"
                      className="px-2 py-1 rounded-md border border-white/10 hover:bg-white/10"
                      onClick={() => startEdit(acc)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      className="px-2 py-1 rounded-md border border-white/10 hover:bg-white/10"
                      onClick={() => void remove(acc.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
                {editingId === acc.id && (
                  <tr className="border-b border-white/5 bg-white/5">
                    <td colSpan={4} className="p-3">
                      <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={onSubmitEdit}>
                        <div className="flex flex-col gap-1">
                          <label htmlFor={`editCode-${acc.id}`} className="text-sm">Código</label>
                          <input
                            id={`editCode-${acc.id}`}
                            className="px-3 py-2 rounded-md bg-transparent border border-white/10"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label htmlFor={`editName-${acc.id}`} className="text-sm">Nome</label>
                          <input
                            id={`editName-${acc.id}`}
                            className="px-3 py-2 rounded-md bg-transparent border border-white/10"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label htmlFor={`editType-${acc.id}`} className="text-sm">Tipo</label>
                          <select
                            id={`editType-${acc.id}`}
                            className="px-3 py-2 rounded-md bg-transparent border border-white/10"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as any)}
                            required
                          >
                            <option value="asset">Ativo</option>
                            <option value="liability">Passivo</option>
                            <option value="equity">Patrimônio</option>
                            <option value="revenue">Receita</option>
                            <option value="expense">Despesa</option>
                          </select>
                        </div>
                        <div className="flex items-end gap-2">
                          <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <button type="button" className="px-3 py-2 rounded-md border border-white/10" onClick={cancelEdit}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">Nenhuma conta encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
          {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
        </Button>
      </div>
    </div>
  );
}

