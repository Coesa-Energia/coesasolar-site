import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { meetsCalculatorMinimums, useEconomyCalculator } from './useEconomyCalculator';

const { queriedTables, failedTable } = vi.hoisted(() => ({ queriedTables: [] as string[], failedTable: { value: '' } }));

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
          error: table === failedTable.value ? { message: 'Falha de consulta' } : null,
        }).then(resolve),
      };
      return query;
    },
  },
}));

beforeEach(() => { queriedTables.length = 0; failedTable.value = ''; });

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

  it('rejeita valores inválidos sem gerar uma estimativa incorreta', () => {
    expect(meetsCalculatorMinimums(500, Number.NaN, 0.86)).toBe(false);
    expect(meetsCalculatorMinimums(500, -10, 0.86)).toBe(false);
    expect(meetsCalculatorMinimums(500, 25, Number.POSITIVE_INFINITY)).toBe(false);
  });
});

it('não calcula tarifa sem ICMS quando a consulta de alíquotas falha', async () => {
  failedTable.value = 'icms_estados';
  vi.resetModules();
  const { useEconomyCalculator: useFreshCalculator } = await import('./useEconomyCalculator');
  const { result } = renderHook(() => useFreshCalculator());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBe('Erro ao carregar configurações');
  expect(result.current.concessionarias[0].id).toContain('fallback');
});

it('carrega a tarifa real sem depender da tabela de planos ausente em produção', async () => {
  const { result } = renderHook(() => useEconomyCalculator());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(queriedTables).toContain('concessionarias');
  expect(queriedTables).not.toContain('planos_comerciais');
  expect(result.current.concessionarias[0].tarifa).toBe(0.86);
  expect(result.current.error).toBeNull();
});
