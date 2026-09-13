// REGRESSÃO 13/09/2026 (migração para Workflow DevKit): a rota não chama mais
// runPipeline() direto — dispara start(generateArticleWorkflow, []) e
// responde 202 na hora, sem esperar a geração terminar. O mecanismo de
// deadline interno (PIPELINE_DEADLINE_MS/Promise.race) que existia contra o
// SIGKILL da Vercel em maxDuration=800s foi REMOVIDO — não é mais
// necessário: o workflow roda fora desta invocação HTTP, sem teto de tempo
// artificial. Os invariantes de negócio que viviam nessa rota (circuit
// breaker de saldo, tolerância de 10% no piso de palavras, alerta na 1ª
// falha do dia) migraram para DENTRO do workflow — ver
// src/workflows/generate-article.regression.test.ts, que testa as funções
// do workflow diretamente (sem bundler: "use step" é um no-op em runtime de
// teste, as funções são chamáveis como funções JS comuns).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const claimBlogRunToday = vi.fn();
const markAlertedIfFirstFailureToday = vi.fn();
vi.mock('@/lib/blog/supabase-blog', () => ({
  claimBlogRunToday,
  markAlertedIfFirstFailureToday,
  // A rota importa workflows/generate-article.ts (pra tipar GenerateArticleResult
  // via generate-status/route.ts, mas o workflow em si é importado transitivamente
  // por editorial-calendar.ts via getServiceClient) — mock vazio evita I/O real.
  getServiceClient: vi.fn(),
  insertArticle: vi.fn(),
  insertRunLog: vi.fn(),
  getPublishedKeywords: vi.fn(),
  getLinkCandidates: vi.fn(),
}));

const sendFailureAlertEmail = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/blog/alert', () => ({ sendFailureAlertEmail }));

const mockStart = vi.fn();
vi.mock('workflow/api', () => ({ start: mockStart }));

function makeRequest(): NextRequest {
  return new NextRequest('https://coesasolar.com.br/api/blog/generate', {
    headers: { authorization: 'Bearer test-secret' },
  });
}

describe('GET /api/blog/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
    markAlertedIfFirstFailureToday.mockResolvedValue(true);
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('sem authorization correto → 401, nunca chama claim nem start', async () => {
    const { GET } = await import('./route');
    const request = new NextRequest('https://coesasolar.com.br/api/blog/generate');
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(claimBlogRunToday).not.toHaveBeenCalled();
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('claim already_run → 200 sem disparar workflow', async () => {
    claimBlogRunToday.mockResolvedValue('already_run');

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('already_run_today');
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('claim error (infra) → 500, alerta disparado, nunca dispara workflow', async () => {
    claimBlogRunToday.mockResolvedValue('error');

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('claim_failed');
    expect(mockStart).not.toHaveBeenCalled();
    expect(sendFailureAlertEmail).toHaveBeenCalledWith(expect.objectContaining({ error: 'claim_failed' }));
  });

  it('claim ok → dispara start(generateArticleWorkflow, []) e responde 202 com runId', async () => {
    claimBlogRunToday.mockResolvedValue('claimed');
    mockStart.mockResolvedValue({ runId: 'wrun_teste' });

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body).toEqual({ ok: true, runId: 'wrun_teste' });
    expect(mockStart).toHaveBeenCalledTimes(1);
    const [, args] = mockStart.mock.calls[0];
    expect(args).toEqual([]);
  });

  it('start() lança → 500, alerta disparado com a mensagem real', async () => {
    claimBlogRunToday.mockResolvedValue('claimed');
    mockStart.mockRejectedValue(new Error('workflow_dispatch_failed'));

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('workflow_dispatch_failed');
    expect(sendFailureAlertEmail).toHaveBeenCalledWith(expect.objectContaining({ error: 'workflow_dispatch_failed' }));
  });
});
