import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useConfiguracoes } from './useConfiguracoes';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('carrega configurações públicas sem inicializar o cliente autenticado', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-test-key');
  vi.stubGlobal('localStorage', { getItem: () => null });
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ chave: 'hero_stats', valor: '[]' }],
  });
  vi.stubGlobal('fetch', fetch);

  const { result } = renderHook(() => useConfiguracoes());
  const second = renderHook(() => useConfiguracoes());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await waitFor(() => expect(second.result.current.loading).toBe(false));

  expect(result.current.configs.hero_stats).toBe('[]');
  expect(fetch).toHaveBeenCalledWith(
    'https://example.supabase.co/rest/v1/configuracoes_sistema?select=chave%2Cvalor',
    { headers: { apikey: 'public-test-key', Authorization: 'Bearer public-test-key' } },
  );
  expect(fetch).toHaveBeenCalledTimes(1);
});
