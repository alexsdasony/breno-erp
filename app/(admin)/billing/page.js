'use client';

import BillingModule from '@/modules/BillingModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Billing() {
  return <BillingModule />;
}
