import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendFailureAlertEmail } = vi.hoisted(() => ({ sendFailureAlertEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/blog/alert', () => ({ sendFailureAlertEmail }));

import { GET } from './route';

beforeEach(() => {
  sendFailureAlertEmail.mockClear();
  sendFailureAlertEmail.mockResolvedValue(undefined); // restoreAllMocks() do afterEach limpa a implementação
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('GET /api/ai/health', () => {
  it('rejects requests without the cron secret before calling OpenRouter', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    const response = await GET(new NextRequest('https://example.com/api/ai/health'));

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses the dedicated CoesaSolar key for a one-token health call', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    vi.stubEnv('COESASOLAR_OPENROUTER_API_KEY', 'dedicated-key');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: 'OK' } }],
    }), { status: 200 }));

    const response = await GET(new NextRequest('https://example.com/api/ai/health', {
      headers: { authorization: 'Bearer secret' },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, model: 'typesafe/jev-router' });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({ Authorization: 'Bearer dedicated-key' });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      model: 'typesafe/jev-router',
      max_tokens: 1,
      provider: { only: ['Anthropic'] },
      plugins: [{
        id: 'jev-router',
        cost_tier: 'low',
        allowed_models: ['anthropic/claude-haiku-5.5', 'anthropic/claude-sonnet-5.5', 'anthropic/claude-opus-5.5'],
      }],
    });
    expect(sendFailureAlertEmail).not.toHaveBeenCalled();
  });

  // REGRESSÃO 02/09/2026: rota virou canário agendado (7h UTC) — precisa alertar quando o
  // modelo principal falha, senão é só mais um endpoint que ninguém olha.
  it('OpenRouter responde erro: dispara o alerta de falha do canário', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    vi.stubEnv('COESASOLAR_OPENROUTER_API_KEY', 'dedicated-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }));

    const response = await GET(new NextRequest('https://example.com/api/ai/health', {
      headers: { authorization: 'Bearer secret' },
    }));

    expect(response.status).toBe(502);
    expect(sendFailureAlertEmail).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('canary_failed') }),
    );
  });

  it('fetch lança (rede indisponível): dispara o alerta mesmo assim', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    vi.stubEnv('COESASOLAR_OPENROUTER_API_KEY', 'dedicated-key');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const response = await GET(new NextRequest('https://example.com/api/ai/health', {
      headers: { authorization: 'Bearer secret' },
    }));

    expect(response.status).toBe(502);
    expect(sendFailureAlertEmail).toHaveBeenCalledOnce();
  });

  it('sem OPENROUTER key: dispara alerta antes de tentar chamar a API', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    const response = await GET(new NextRequest('https://example.com/api/ai/health', {
      headers: { authorization: 'Bearer secret' },
    }));

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendFailureAlertEmail).toHaveBeenCalledOnce();
  });
});
