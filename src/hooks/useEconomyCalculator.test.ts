import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { meetsCalculatorMinimums } from './useEconomyCalculator';

const { queriedTables, failedTable, missingName } = vi.hoisted(() => ({
  queriedTables: [] as string[],
  failedTable: { value: '' },
  missingName: { value: '' },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      queriedTables.push(table);
      let names: string[] = [];
      const query = {
        select: () => query,
        or: () => query,
        in: (_column: string, values: string[]) => { names = values; return query; },
        then: (resolve: (result: unknown) => unknown) => Promise.resolve({
          data: table === 'configuracoes_sistema' ? [{
            chave: 'economy_main_distribuidoras',
            valor: JSON.stringify([
              { nome: 'CEMIG-D', uf: 'MG', tarifa: 0.8 },
              { nome: 'COELBA', uf: 'BA', tarifa: 0.82 },
              { nome: 'CPFL-PAULISTA', uf: 'SP', tarifa: 0.78 },
              { nome: 'ENERGISA', uf: 'MT', tarifa: 0.7 },
            ]),
          }] : table === 'concessionarias' ? [
            { id: '1', nome: 'CEMIG-D', uf: 'MG', tarifa_com_impostos: 0.86 },
            { id: '2', nome: 'Energisa MG', uf: 'MG', tarifa_com_impostos: 0.95 },
            { id: '3', nome: 'COELBA', uf: 'BA', tarifa_com_impostos: 0.82 },
            { id: '4', nome: 'EMR', uf: 'MG', tarifa_com_impostos: 0.97 },
          ].filter(row => names.includes(row.nome) && row.nome !== missingName.value) : [],
          error: table === failedTable.value ? { message: 'Falha de consulta' } : null,
        }).then(resolve),
      };
      return query;
    },
  },
}));

beforeEach(() => {
  queriedTables.length = 0;
  failedTable.value = '';
  missingName.value = '';
  vi.resetModules();
});

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
  const { useEconomyCalculator: useFreshCalculator } = await import('./useEconomyCalculator');
  const { result } = renderHook(() => useFreshCalculator());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBe('Erro ao carregar configurações');
  expect(result.current.concessionarias).toEqual([
    expect.objectContaining({ nome: 'CEMIG', id: expect.stringContaining('fallback') }),
    expect.objectContaining({ nome: 'Energisa MG', id: expect.stringContaining('fallback') }),
  ]);
});

it('usa as tarifas reais das distribuidoras atendidas mesmo com configuração legada', async () => {
  const { useEconomyCalculator } = await import('./useEconomyCalculator');
  const { result } = renderHook(() => useEconomyCalculator());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(queriedTables).toContain('concessionarias');
  expect(queriedTables).not.toContain('planos_comerciais');
  expect(result.current.concessionarias).toEqual([
    { id: '1', nome: 'CEMIG', uf: 'MG', tarifa: 0.86 },
    { id: '2', nome: 'Energisa MG', uf: 'MG', tarifa: 0.95 },
  ]);
  expect(result.current.error).toBeNull();
});

it('preserva a tarifa configurada de uma distribuidora atendida sem registro no banco', async () => {
  missingName.value = 'CEMIG-D';
  const { useEconomyCalculator } = await import('./useEconomyCalculator');
  const { result } = renderHook(() => useEconomyCalculator());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.concessionarias).toEqual([
    { id: 'cemig-d-fallback', nome: 'CEMIG', uf: 'MG', tarifa: 0.8 },
    { id: '2', nome: 'Energisa MG', uf: 'MG', tarifa: 0.95 },
  ]);
});

it('usa a tarifa do alias EMR sem expor outra opção quando Energisa MG não tem registro', async () => {
  missingName.value = 'Energisa MG';
  const { useEconomyCalculator } = await import('./useEconomyCalculator');
  const { result } = renderHook(() => useEconomyCalculator());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.concessionarias).toEqual([
    { id: '1', nome: 'CEMIG', uf: 'MG', tarifa: 0.86 },
    { id: '4', nome: 'Energisa MG', uf: 'MG', tarifa: 0.97 },
  ]);
});
