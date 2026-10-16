import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { meetsCalculatorMinimums, useEconomyCalculator } from './useEconomyCalculator';

const queriedTables = vi.hoisted(() => [] as string[]);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      queriedTables.push(table);
      const query = {
        select: () => query,
        or: () => query,
        in: () => query,
        then: (resolve: (result: unknown) => unknown) => Promise.resolve({
          data: table === 'concessionarias'
            ? [{ id: '1', nome: 'CEMIG-D', uf: 'MG', tarifa_com_impostos: 0.86, tarifa_media: 0.79 }]
            : [],
          error: table === 'planos_comerciais' ? { message: 'PGRST205' } : null,
        }).then(resolve),
      };
      return query;
    },
  },
}));

beforeEach(() => { queriedTables.length = 0; });

describe('mínimos da calculadora', () => {
  it('exige conta de pelo menos R$ 300 por mês', () => {
    expect(meetsCalculatorMinimums(299.99, 25, 0.86)).toBe(false);
    expect(meetsCalculatorMinimums(300, 25, 0.86)).toBe(true);
  });

  it('exige consumo estimado de pelo menos 300 kWh por mês', () => {
    expect(meetsCalculatorMinimums(324.99, 25, 1)).toBe(false);
    expect(meetsCalculatorMinimums(325, 25, 1)).toBe(true);
    expect(meetsCalculatorMinimums(300, 25, 1)).toBe(false);
  });
});

it('carrega a tarifa real sem depender da tabela de planos ausente em produção', async () => {
  const { result } = renderHook(() => useEconomyCalculator());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(queriedTables).toContain('concessionarias');
  expect(queriedTables).not.toContain('planos_comerciais');
  expect(result.current.concessionarias[0].tarifa).toBe(0.86);
  expect(result.current.error).toBeNull();
});
