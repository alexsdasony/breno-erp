'use client';

import InventoryView from './_components/InventoryView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Inventory() {
  return <InventoryView />;
}
