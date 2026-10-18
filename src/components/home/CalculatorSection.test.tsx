import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CalculatorSection } from './CalculatorSection';

vi.mock('next/dynamic', () => ({ default: () => () => <span>Calculadora pronta</span> }));
afterEach(() => vi.unstubAllGlobals());

it('mantém o título e carrega a calculadora antes de entrar na tela', () => {
  let notify: IntersectionObserverCallback | undefined;
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe = vi.fn();
    disconnect = vi.fn();
  });

  const { container } = render(<CalculatorSection />);
  expect(screen.getByRole('heading', { name: /Sua economia/ })).toBeInTheDocument();
  expect(container.querySelector('#calculadora [aria-busy="true"]')).toBeInTheDocument();
  expect(screen.queryByText('Calculadora pronta')).not.toBeInTheDocument();

  act(() => notify?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(screen.getByText('Calculadora pronta')).toBeInTheDocument();
});
