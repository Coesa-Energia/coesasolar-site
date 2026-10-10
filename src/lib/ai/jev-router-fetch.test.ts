import { afterEach, describe, expect, it, vi } from 'vitest';
import { createJevRouterFetch } from './jev-router-fetch';

afterEach(() => vi.unstubAllEnvs());

function request(body: unknown): [string, RequestInit] {
  return ['https://openrouter.ai/api/v1/chat/completions', { method: 'POST', body: JSON.stringify(body) }];
}

describe('Jev Router fetch', () => {
  it('fica desligado por padrão', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}'));
    await createJevRouterFetch(fetchImpl)(...request({ model: 'fixed', messages: [{ role: 'user', content: 'oi' }] }));
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).model).toBe('fixed');
  });

  it('roteia texto e mantém o modelo fixo como fallback', async () => {
    vi.stubEnv('OPENROUTER_JEV_PERCENT', '100');
    vi.stubEnv('OPENROUTER_JEV_COST_TIER', 'low');
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response('{"error":"down"}', { status: 503 }))
      .mockResolvedValueOnce(new Response('{"choices":[{"message":{"content":"ok"}}]}'));
    await createJevRouterFetch(fetchImpl)(...request({ model: 'fixed', messages: [{ role: 'user', content: 'oi' }] }));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      model: 'typesafe/jev-router', plugins: [{ id: 'jev-router', cost_tier: 'low' }],
    });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).model).toBe('fixed');
  });

  it('roteia mensagem multimodal com saída textual', async () => {
    vi.stubEnv('OPENROUTER_JEV_PERCENT', '100');
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}'));
    await createJevRouterFetch(fetchImpl)(...request({
      model: 'vision', messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: 'x' } }] }],
    }));
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).model).toBe('typesafe/jev-router');
  });

  it('mantém o modelo fixo quando a chamada Jev falha na rede', async () => {
    vi.stubEnv('OPENROUTER_JEV_PERCENT', '100');
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce(new Response('{"choices":[{"message":{"content":"ok"}}]}'));
    await createJevRouterFetch(fetchImpl)(...request({ model: 'fixed', messages: [{ role: 'user', content: 'oi' }] }));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).model).toBe('fixed');
  });
});
