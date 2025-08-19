'use client';

import ProfileModule from '@/modules/ProfileModule';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function Profile() {
  return <ProfileModule />;
}
