'use client';

import ChartOfAccountsModule from '@/modules/ChartOfAccountsModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function ChartOfAccounts() {
  return <ChartOfAccountsModule />;
}
