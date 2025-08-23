'use client';

import NFeView from './_components/NFeView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function NFe() {
  return <NFeView />;
}
