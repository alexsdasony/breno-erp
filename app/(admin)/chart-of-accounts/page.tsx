'use client';

import ChartOfAccountsView from './_components/ChartOfAccountsView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function ChartOfAccounts() {
  return <ChartOfAccountsView />;
}
