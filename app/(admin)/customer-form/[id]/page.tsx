'use client';

import CustomerFormView from '../_components/CustomerFormView';
import { useParams } from 'next/navigation';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>();
  return <CustomerFormView id={parseInt(id)} />;
}
