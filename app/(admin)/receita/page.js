'use client';

import ReceitaModule from '@/modules/ReceitaModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Receita() {
  return <ReceitaModule />;
}
