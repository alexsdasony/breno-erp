'use client';

import CustomerFormPage from '../page';

export default function CustomerEditPage({ params }) {
  return <CustomerFormPage id={parseInt(params.id)} />;
}
