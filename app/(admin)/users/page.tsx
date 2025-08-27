'use client';

import UsersView from './_components/UsersView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Users() {
  return <UsersView />;
}