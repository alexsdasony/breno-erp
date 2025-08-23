'use client';

import ReceitaView from './_components/ReceitaView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Receita() {
  return <ReceitaView />;
}
