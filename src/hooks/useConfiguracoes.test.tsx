import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useConfiguracoes } from './useConfiguracoes';

const query = vi.hoisted(() => ({
  select: vi.fn().mockResolvedValue({ data: [{ chave: 'empresa_nome', valor: 'COESA teste' }], error: null }),
  eq: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ select: query.select, update: () => ({ eq: query.eq }) }) },
}));

describe('useConfiguracoes', () => {
  it('carrega e atualiza configurações mesmo com o cliente importado sob demanda', async () => {
    const { result } = renderHook(() => useConfiguracoes());

    await waitFor(() => expect(result.current.configs.empresa_nome).toBe('COESA teste'));
    await act(async () => {
      expect(await result.current.updateConfig('empresa_nome', 'COESA atualizada')).toBe(true);
    });

    expect(result.current.configs.empresa_nome).toBe('COESA atualizada');
    expect(query.eq).toHaveBeenCalledWith('chave', 'empresa_nome');
  });
});
