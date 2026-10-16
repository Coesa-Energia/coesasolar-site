import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { EconomyCalculator } from './EconomyCalculator';

const calcular = vi.hoisted(() => vi.fn(() => null));

vi.mock('@/hooks/useEconomyCalculator', () => ({
  useEconomyCalculator: () => ({
    config: { cipDefault: 25, tarifaFallback: 0.79 },
    concessionarias: [
      { id: '1', nome: 'CEMIG-D', uf: 'MG', tarifa: 0.86 },
      { id: '2', nome: 'COELBA', uf: 'BA', tarifa: 0.82 },
    ],
    loading: false,
    calcular,
    getWhatsAppLink: () => '#',
  }),
}));

it('usa CIP, instalação e distribuidora selecionadas no cálculo', () => {
  calcular.mockClear();
  render(<EconomyCalculator />);
  fireEvent.change(screen.getByLabelText('Quanto você paga de luz por mês?'), { target: { value: '50000' } });
  expect(calcular).toHaveBeenLastCalledWith(500, 20, undefined, 'Bifásico', 0.86);

  fireEvent.change(screen.getByLabelText('Iluminação pública (R$)'), { target: { value: '30' } });
  fireEvent.change(screen.getByLabelText('Tipo de instalação'), { target: { value: 'Trifásico' } });
  fireEvent.change(screen.getByLabelText('Distribuidora'), { target: { value: 'COELBA' } });
  expect(calcular).toHaveBeenLastCalledWith(500, 20, 30, 'Trifásico', 0.82);
});
