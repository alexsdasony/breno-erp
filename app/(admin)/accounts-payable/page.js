'use client';

import AccountsPayableModule from '@/modules/AccountsPayableModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function AccountsPayable() {
  return <AccountsPayableModule />;
}
