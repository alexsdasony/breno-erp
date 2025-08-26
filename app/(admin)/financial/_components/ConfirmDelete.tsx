"use client";

import React from 'react';

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDelete({ open, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-white/10 rounded-md p-6 max-w-sm w-full">
        <div className="text-lg font-medium mb-2">Você tem certeza?</div>
        <p className="text-sm text-gray-400 mb-4">Esta ação não poderá ser desfeita.</p>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 rounded-md border border-white/10" onClick={onCancel}>Cancelar</button>
          <button className="px-3 py-2 rounded-md border border-red-500 text-red-400" onClick={() => void onConfirm()}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
