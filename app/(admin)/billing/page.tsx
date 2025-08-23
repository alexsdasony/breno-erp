'use client';

import BillingView from './_components/BillingView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Billing() {
  return <BillingView />;
}
