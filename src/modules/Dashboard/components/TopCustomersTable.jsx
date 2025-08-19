import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyBR, formatDateBR, formatNumber } from '@/utils/format.js';
import { TopCustomer } from '../mocks/dashboard.mock.js';

export const TopCustomersTable = ({ customers }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Principais Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cliente
                </th>
                <th className="text-right py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pedidos
                </th>
                <th className="text-right py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Receita
                </th>
                <th className="text-right py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Último Pedido
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 px-1 text-sm text-gray-900 dark:text-gray-100">
                    <div className="font-medium">{customer.name}</div>
                  </td>
                  <td className="py-3 px-1 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatNumber(customer.orders)}
                  </td>
                  <td className="py-3 px-1 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                    {formatCurrencyBR(customer.revenue)}
                  </td>
                  <td className="py-3 px-1 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatDateBR(customer.lastOrder)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
