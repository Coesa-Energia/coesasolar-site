import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const { getServiceClient, from, select, eq, inFilter, gte, lt, maybeSingle } = vi.hoisted(() => ({
  getServiceClient: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), inFilter: vi.fn(), gte: vi.fn(), lt: vi.fn(), maybeSingle: vi.fn(),
}));

vi.mock('@/lib/blog/supabase-blog', () => ({ getServiceClient }));

const start = '2026-11-24T03:00:00.000Z';
const end = '2026-11-25T03:00:00.000Z';

function request(options: { authorization?: string; start?: string; end?: string } = {}) {
  const url = new URL('https://coesasolar.com.br/api/blog/observation');
  url.searchParams.set('start', options.start ?? start);
  url.searchParams.set('end', options.end ?? end);
  return new Request(url, { headers: { Authorization: options.authorization ?? 'Bearer observer-token' } });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('COESA_BLOG_OBSERVATION_TOKEN', 'observer-token');
  vi.setSystemTime(new Date('2026-11-25T12:30:00.000Z'));
  const query = { select, eq, in: inFilter, gte, lt, maybeSingle };
  from.mockReturnValue(query);
  select.mockReturnValue(query);
  eq.mockReturnValue(query);
  inFilter.mockReturnValue(query);
  gte.mockReturnValue(query);
  lt.mockReturnValue(query);
  getServiceClient.mockReturnValue({ from });
  maybeSingle.mockResolvedValue({ data: null, error: null });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('leitura privada do autoblog Coesa', () => {
  it.each(['', 'Bearer wrong-token', 'observer-token'])('rejeita autorização inválida antes do banco', async (authorization) => {
    expect((await GET(request({ authorization }))).status).toBe(401);
    expect(getServiceClient).not.toHaveBeenCalled();
  });

  it('não permite acesso quando o token dedicado está ausente', async () => {
    vi.stubEnv('COESA_BLOG_OBSERVATION_TOKEN', '');
    expect((await GET(request())).status).toBe(401);
    expect(getServiceClient).not.toHaveBeenCalled();
  });

  it.each([
    ['2026-11-24T00:00:00.000Z', end],
    [start, '2026-11-26T03:00:00.000Z'],
    [end, '2026-11-26T03:00:00.000Z'],
    ['2026-02-30T03:00:00.000Z', '2026-03-03T03:00:00.000Z'],
    ['not-a-timestamp', end],
    ['2026-11-24T03:00:00.999Z', end],
    [start, '2026-11-25T03:00:00.999Z'],
  ])('rejeita janela aberta ou divergente do dia civil de Brasília', async (start, end) => {
    expect((await GET(request({ start, end }))).status).toBe(400);
    expect(getServiceClient).not.toHaveBeenCalled();
  });

  it('prova falha persistida sem incluir erro nem pauta privados', async () => {
    const createdAt = '2026-11-24T18:50:48.619823Z';
    maybeSingle.mockResolvedValueOnce({ data: { status: 'error', created_at: createdAt, error: 'internal' }, error: null });
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      schema: 'coesa-autoblog-observation:1',
      window: { date: '2026-11-24', time_zone: 'America/Sao_Paulo', start, end_exclusive: end },
      run: { status: 'error', created_at: createdAt },
      article: null,
    });
    expect(from.mock.calls).toEqual([['coesa_blog_run_log'], ['coesa_articles']]);
    expect(select.mock.calls).toEqual([['status,created_at'], ['slug,published_at']]);
    expect(inFilter.mock.calls).toEqual([['run_date', ['2026-11-24', '2026-11-25']]]);
    expect(eq.mock.calls).toEqual([['status', 'published']]);
    expect(gte.mock.calls).toEqual([['created_at', start], ['published_at', start]]);
    expect(lt.mock.calls).toEqual([['created_at', end], ['published_at', end]]);
  });

  it('cobre uma tentativa noturna gravada no dia UTC seguinte', async () => {
    const createdAt = '2026-11-25T01:00:00.000Z';
    maybeSingle.mockResolvedValueOnce({ data: { status: 'error', created_at: createdAt }, error: null });
    const body = await (await GET(request())).json();
    expect(inFilter).toHaveBeenCalledWith('run_date', ['2026-11-24', '2026-11-25']);
    expect(body.run).toEqual({ status: 'error', created_at: createdAt });
  });

  it('registra artigo público mesmo sem execução correspondente', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({
      data: { slug: 'artigo-confirmado', published_at: '2026-11-24T09:05:02.111Z', keyword: 'internal' }, error: null,
    });
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      run: null, article: { slug: 'artigo-confirmado', published_at: '2026-11-24T09:05:02.111Z' },
    });
    expect(select).not.toHaveBeenCalledWith(expect.stringContaining('keyword'));
  });

  it.each([
    { message: 'private' },
    { code: 'PGRST116', message: 'Multiple rows' },
  ])('indisponibilidade ou registros ambíguos preservam incerteza', async (error) => {
    maybeSingle.mockResolvedValueOnce({ data: null, error });
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'source_unavailable' });
  });
});
