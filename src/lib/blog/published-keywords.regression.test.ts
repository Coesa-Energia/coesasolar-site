import { describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { getPublishedKeywords } from './supabase-blog';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));

describe('histórico de pautas publicadas', () => {
  it('normaliza a keyword de uma reserva e consulta todas as páginas com o mesmo prazo', async () => {
    const abortSignal = vi.fn()
      .mockResolvedValueOnce({ data: [{ keyword: null }], error: null, count: 2 })
      .mockResolvedValueOnce({ data: [{ keyword: ' crédito solar ' }], error: null, count: 2 });
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnValue({ abortSignal }),
    };
    const from = vi.fn().mockReturnValue(query);
    vi.mocked(createClient).mockReturnValue({ from } as unknown as ReturnType<typeof createClient>);
    const { signal } = new AbortController();

    await expect(getPublishedKeywords(signal)).resolves.toEqual(['crédito solar']);
    expect(query.range.mock.calls.map(([from]) => from)).toEqual([0, 1]);
    expect(abortSignal.mock.calls).toEqual([[signal], [signal]]);
  });
});
