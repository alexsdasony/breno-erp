'use client';

import AccountsPayableView from './_components/AccountsPayableView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function AccountsPayable() {
  return <AccountsPayableView />;
}
