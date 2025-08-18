import DashboardModule from '@/modules/DashboardModule';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visão geral dos principais indicadores do negócio
        </p>
      </div>
      
      <DashboardModule />
    </div>
  );
}
