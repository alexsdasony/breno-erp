import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrencyBR, formatNumber } from '@/utils/format.js';
import { cn } from '@/lib/utils';

export const KpiCard = ({
  title,
  value,
  subtitle,
  delta,
  icon,
  formatAsCurrency = false,
  formatAsNumber = false,
}) => {
  const formatValue = (val) => {
    if (formatAsCurrency) return formatCurrencyBR(val);
    if (formatAsNumber) return formatNumber(val);
    return val.toString();
  };

  const getDeltaColor = (deltaValue) => {
    if (deltaValue > 0) return 'text-green-600 dark:text-green-400';
    if (deltaValue < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getDeltaIcon = (deltaValue) => {
    if (deltaValue > 0) return <TrendingUp className="w-4 h-4" />;
    if (deltaValue < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatValue(value)}
              </p>
              {delta !== undefined && (
                <div className={cn('flex items-center space-x-1', getDeltaColor(delta))}>
                  {getDeltaIcon(delta)}
                  <span className="text-sm font-medium">
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
