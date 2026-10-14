import { describe, expect, it } from 'vitest';
import { meetsCalculatorMinimums } from './useEconomyCalculator';

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
