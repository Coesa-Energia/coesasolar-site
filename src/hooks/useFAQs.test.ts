import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useFAQs } from './useFAQs';

it('descreve o desconto sobre energia compensada sem prometer valor exato', () => {
  const { result } = renderHook(() => useFAQs());
  const answer = result.current.faqs.find((faq) => faq.question.startsWith('Quanto vou economizar'))?.answer;
  expect(answer).toContain('20% sobre a energia compensada');
  expect(answer).not.toContain('valor exato');
  expect(result.current.loading).toBe(false);
});
