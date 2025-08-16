'use client';

import ProductsModule from '@/modules/Products/ProductsModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Inventory() {
  return <ProductsModule />;
}
