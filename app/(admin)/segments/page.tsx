'use client';

import SegmentsView from './_components/SegmentsView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Segments() {
  return <SegmentsView />;
}
