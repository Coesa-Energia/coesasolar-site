import { describe, expect, it } from 'vitest';
import { solarEnergyMwh, solarMinuteAtX, solarPowerKw } from './solar-day';

describe('dia ilustrativo de uma usina de 1 MWp', () => {
  it('não gera energia durante a noite e nunca supera 1 MW', () => {
    expect(solarPowerKw(5 * 60)).toBe(0);
    expect(solarPowerKw(19 * 60)).toBe(0);
    expect(solarPowerKw(12 * 60)).toBeLessThan(1000);
  });

  it('acumula a produção até o pôr do sol', () => {
    expect(solarEnergyMwh(6 * 60)).toBe(0);
    expect(solarEnergyMwh(15 * 60)).toBeGreaterThan(solarEnergyMwh(12 * 60));
    expect(solarEnergyMwh(19 * 60)).toBeCloseTo(solarEnergyMwh(18 * 60));
  });

  it('converte o arraste do sol em horários dentro da curva', () => {
    expect(solarMinuteAtX(80, 0, 1000)).toBe(6 * 60);
    expect(solarMinuteAtX(500, 0, 1000)).toBe(12 * 60);
    expect(solarMinuteAtX(920, 0, 1000)).toBe(18 * 60);
    expect(solarMinuteAtX(-100, 0, 1000)).toBe(6 * 60);
    expect(solarMinuteAtX(1100, 0, 1000)).toBe(18 * 60);
  });
});
