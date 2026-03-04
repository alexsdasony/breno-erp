'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { Period } from '@/lib/periodUtils';

interface PeriodSelectorProps {
  period: Period;
  setPeriod: (p: Period) => void;
  customStart: string;
  setCustomStart: (s: string) => void;
  customEnd: string;
  setCustomEnd: (s: string) => void;
  /** Se true, oculta a linha "Filtrar por ano" (opcional) */
  hideYearButtons?: boolean;
}

export function PeriodSelector({
  period,
  setPeriod,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  hideYearButtons = false,
}: PeriodSelectorProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400 mr-2">Período:</span>
        <Button
          variant={period === 'current_month' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setPeriod('current_month')}
        >
          Mês atual
        </Button>
        <Button variant={period === '7d' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('7d')}>
          7d
        </Button>
        <Button variant={period === '30d' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('30d')}>
          30d
        </Button>
        <Button variant={period === '90d' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('90d')}>
          90d
        </Button>
        <Button variant={period === '6mo' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('6mo')}>
          6mo
        </Button>
        <Button variant={period === '1yr' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('1yr')}>
          1 ano
        </Button>
        <Button
          variant={period === 'last-year' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setPeriod('last-year')}
        >
          Ano passado
        </Button>
        <Button variant={period === 'custom' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('custom')}>
          Personalizado
        </Button>
      </div>

      {!hideYearButtons && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-sm text-gray-400 mr-2">Filtrar por ano:</span>
          <Button
            variant={period === 'year-2021' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('year-2021')}
          >
            2021
          </Button>
          <Button
            variant={period === 'year-2022' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('year-2022')}
          >
            2022
          </Button>
          <Button
            variant={period === 'year-2023' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('year-2023')}
          >
            2023
          </Button>
          <Button
            variant={period === 'year-2024' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('year-2024')}
          >
            2024
          </Button>
          <Button
            variant={period === 'year-2025' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('year-2025')}
          >
            2025
          </Button>
        </div>
      )}

      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-sm text-gray-400 mr-2">Período personalizado:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Data inicial"
          />
          <span className="text-sm text-gray-400">até</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Data final"
          />
        </div>
      )}
    </>
  );
}
