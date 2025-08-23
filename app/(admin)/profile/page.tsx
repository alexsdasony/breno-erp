'use client';

import ProfileView from './_components/ProfileView';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Profile() {
  return <ProfileView />;
}
