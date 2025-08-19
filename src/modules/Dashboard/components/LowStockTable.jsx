import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/utils/format.js';
import { LowStockProduct } from '../mocks/dashboard.mock.js';

export const LowStockTable = ({ products }) => {
  const getStockStatus = (stock, minStock) => {
    const deficit = minStock - stock;
    if (deficit > 0) {
      return deficit >= minStock * 0.5 ? 'Crítico' : 'Atenção';
    }
    return 'OK';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Crítico':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Atenção':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Estoque Baixo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  SKU
                </th>
                <th className="text-left py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Produto
                </th>
                <th className="text-right py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Estoque
                </th>
                <th className="text-right py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mínimo
                </th>
                <th className="text-right py-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Situação
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const status = getStockStatus(product.stock, product.minStock);
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-1 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {product.sku}
                    </td>
                    <td className="py-3 px-1 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{product.name}</div>
                    </td>
                    <td className="py-3 px-1 text-sm text-right text-gray-600 dark:text-gray-400">
                      {formatNumber(product.stock)}
                    </td>
                    <td className="py-3 px-1 text-sm text-right text-gray-600 dark:text-gray-400">
                      {formatNumber(product.minStock)}
                    </td>
                    <td className="py-3 px-1 text-sm text-right">
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
