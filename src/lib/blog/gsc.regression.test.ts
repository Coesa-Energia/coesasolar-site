import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEED_KEYWORDS } from './seed-keywords';
import { fetchTopKeyword, getSeedSkippingPublished, pickTopEligibleGscKeyword, readGscKeyword } from './gsc';

const { query, oauthOptions } = vi.hoisted(() => ({ query: vi.fn(), oauthOptions: vi.fn() }));
vi.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: class {
      constructor(options: unknown) { oauthOptions(options); }
      setCredentials = vi.fn();
    } },
    searchconsole: () => ({ searchanalytics: { query } }),
  },
}));

const LEGACY_SEEDS = [
  'energia solar por assinatura como funciona',
  'economizar na conta de luz sem instalação',
  'geração distribuída compartilhada vale a pena',
  'quanto economiza energia solar por assinatura',
  'energia solar sem investimento inicial',
  'desconto na conta de luz Minas Gerais',
];

describe('REGRESSÃO 11/09/2026: fallback não recicla pauta publicada', () => {
  it('retorna undefined quando todo o catálogo já foi publicado', () => {
    expect(getSeedSkippingPublished(SEED_KEYWORDS, 0)).toBeUndefined();
  });

  it('mantém pauta-reserva quando as seis seeds originais já foram publicadas', () => {
    expect(getSeedSkippingPublished(LEGACY_SEEDS, 0)).toBeTruthy();
  });
});

describe('REGRESSÃO 21/10/2026: GSC não exige cinco opções para resolver uma pauta', () => {
  it('usa a única consulta inédita elegível', () => {
    expect(pickTopEligibleGscKeyword([
      { keys: ['já publicada'], position: 8, impressions: 100 },
      { keys: ['energia solar para comércio'], position: 12, impressions: 40 },
    ], ['já publicada'])).toBe('energia solar para comércio');
  });

  it('prioriza impressões sem aceitar posição fora de 4–30', () => {
    expect(pickTopEligibleGscKeyword([
      { keys: ['posição ruim'], position: 31, impressions: 1000 },
      { keys: ['melhor oportunidade'], position: 20, impressions: 30 },
      { keys: ['segunda oportunidade'], position: 10, impressions: 20 },
    ], [])).toBe('melhor oportunidade');
  });
});

describe('falha de renovação da credencial GSC', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'fixture-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'fixture-secret');
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', 'fixture-token');
    query.mockReset();
    oauthOptions.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('indica falha terminal quando o Google rejeita a credencial e o catálogo se esgotou', async () => {
    query.mockRejectedValue(new Error('invalid_grant'));

    await expect(fetchTopKeyword(SEED_KEYWORDS)).rejects.toMatchObject({
      name: 'FatalError',
      message: 'gsc_invalid_grant_no_keyword',
    });
  });

  it('reconhece a resposta estruturada após a biblioteca trocar a mensagem por JSON', async () => {
    const data = { error: 'invalid_grant', error_description: 'ReAuth required' };
    query.mockRejectedValue(Object.assign(new Error(JSON.stringify(data)), { response: { data, status: 400 } }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(fetchTopKeyword(SEED_KEYWORDS)).rejects.toMatchObject({
      name: 'FatalError',
      message: 'gsc_invalid_grant_no_keyword',
    });
    expect(warn).toHaveBeenCalledExactlyOnceWith('[gsc] Search Console indisponível:', 'invalid_grant', 400);
  });

  it('usa a última pauta inédita de reserva quando o Google rejeita a credencial', async () => {
    query.mockRejectedValue(new Error('invalid_grant'));

    await expect(fetchTopKeyword(SEED_KEYWORDS.slice(0, -1))).resolves.toBe(SEED_KEYWORDS.at(-1));
  });

  it('preserva a resolução normal para indisponibilidade transitória e para consultas elegíveis', async () => {
    query.mockRejectedValueOnce(Object.assign(new Error('resposta indisponível: fixture-token'), {
      response: { status: 503, data: { error: 'temporarily_unavailable' } },
      config: { data: 'refresh_token=fixture-token' },
    }));
    query.mockResolvedValueOnce({ data: { rows: [{ keys: ['pauta inédita'], position: 12, impressions: 40 }] } });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(fetchTopKeyword(SEED_KEYWORDS)).resolves.toBeUndefined();
    await expect(fetchTopKeyword(SEED_KEYWORDS)).resolves.toBe('pauta inédita');
    expect(warn).toHaveBeenCalledExactlyOnceWith('[gsc] Search Console indisponível:', 'request_failed', 503);
  });

  it('aplica o mesmo prazo à renovação OAuth e à consulta de palavras-chave', async () => {
    const { signal } = new AbortController();
    query.mockResolvedValue({ data: { rows: [] } });

    await expect(readGscKeyword([], signal)).resolves.toEqual({ state: 'no_eligible' });
    expect(oauthOptions).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ transporterOptions: { signal } }));
    expect(query).toHaveBeenCalledExactlyOnceWith(expect.any(Object), { signal });
  });
});
