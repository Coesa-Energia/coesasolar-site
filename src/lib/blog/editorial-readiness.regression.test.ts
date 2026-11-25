import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAvailableEditorialReserves } from './editorial-calendar';
import { recordEditorialReadiness } from './editorial-readiness';
import { readGscKeyword } from './gsc';
import { getPublishedKeywords } from './supabase-blog';

vi.mock('./editorial-calendar', () => ({ getAvailableEditorialReserves: vi.fn() }));
vi.mock('./gsc', () => ({ readGscKeyword: vi.fn() }));
vi.mock('./supabase-blog', () => ({ getPublishedKeywords: vi.fn() }));

describe('canário de prontidão editorial', () => {
  beforeEach(() => {
    vi.mocked(getPublishedKeywords).mockReset().mockResolvedValue(['pauta publicada']);
    vi.mocked(readGscKeyword).mockReset().mockResolvedValue({ state: 'eligible', keyword: 'pauta inédita' });
    vi.mocked(getAvailableEditorialReserves).mockReset().mockResolvedValue([]);
  });

  afterEach(() => vi.restoreAllMocks());

  it.each(['invalid_grant', 'no_eligible'] as const)('distingue %s de estoque vazio', async (state) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(readGscKeyword).mockResolvedValue({ state });

    await recordEditorialReadiness();

    expect(warn).toHaveBeenCalledExactlyOnceWith('[blog/editorial-readiness]', {
      searchConsole: state, reserveReady: 0, minimumReserve: 5,
    });
  });

  it('sinaliza leitura indisponível com contagem nula', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(getAvailableEditorialReserves).mockRejectedValue(new Error('private data'));

    await recordEditorialReadiness();

    expect(warn).toHaveBeenCalledExactlyOnceWith('[blog/editorial-readiness]', {
      searchConsole: 'eligible', reserveReady: null, minimumReserve: 5,
    });
  });

  it('registra cobertura quando há cinco reservas e o Search Console está apto', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reserves = Array.from({ length: 5 }, (_, index) => ({
      keyword: `reserva ${index + 1}`, relatedKeywords: [], competitors: [], attentionPoints: '',
    }));
    vi.mocked(getAvailableEditorialReserves).mockResolvedValue(reserves);

    await recordEditorialReadiness();

    expect(info).toHaveBeenCalledExactlyOnceWith('[blog/editorial-readiness]', {
      searchConsole: 'eligible', reserveReady: 5, minimumReserve: 5,
    });
    expect(warn).not.toHaveBeenCalled();
  });
});
