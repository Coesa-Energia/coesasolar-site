import { afterEach, describe, expect, it, vi } from 'vitest';
import { createJevRouterFetch } from './jev-router-fetch';

afterEach(() => vi.unstubAllEnvs());

function request(body: unknown): [string, RequestInit] {
  return ['https://openrouter.ai/api/v1/chat/completions', { method: 'POST', body: JSON.stringify(body) }];
}

describe('Jev Router fetch', () => {
  it('roteia pelo Jev por padrão', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{"choices":[{"message":{"content":"ok"}}]}'));
    await createJevRouterFetch(fetchImpl)(...request({ model: 'fixed', messages: [{ role: 'user', content: 'oi' }] }));
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({ model: 'typesafe/jev-router', provider: { only: ['Anthropic'] } });
  });

  it('roteia texto e usa Claude direto como fallback', async () => {
    vi.stubEnv('OPENROUTER_JEV_PERCENT', '100');
    vi.stubEnv('OPENROUTER_JEV_COST_TIER', 'low');
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response('{"error":"down"}', { status: 503 }))
      .mockResolvedValueOnce(new Response('{"choices":[{"message":{"content":"ok"}}]}'));
    await createJevRouterFetch(fetchImpl)(...request({ model: 'fixed', messages: [{ role: 'user', content: 'oi' }] }));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      model: 'typesafe/jev-router', provider: { only: ['Anthropic'] }, plugins: [{ id: 'jev-router', cost_tier: 'low', allowed_models: ['anthropic/claude-haiku-5.5', 'anthropic/claude-sonnet-5.5', 'anthropic/claude-opus-5.5'] }],
    });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toMatchObject({ model: 'anthropic/claude-haiku-5.5', provider: { only: ['Anthropic'] } });
  });

  it('roteia mensagem multimodal com saída textual', async () => {
    vi.stubEnv('OPENROUTER_JEV_PERCENT', '100');
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}'));
    await createJevRouterFetch(fetchImpl)(...request({
      model: 'vision', messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: 'x' } }] }],
    }));
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).model).toBe('typesafe/jev-router');
  });

  it('mantém Claude direto quando a chamada Jev falha na rede', async () => {
    vi.stubEnv('OPENROUTER_JEV_PERCENT', '100');
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce(new Response('{"choices":[{"message":{"content":"ok"}}]}'));
    await createJevRouterFetch(fetchImpl)(...request({ model: 'fixed', messages: [{ role: 'user', content: 'oi' }] }));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).model).toBe('anthropic/claude-haiku-5.5');
  });

  it('preserva a rota original se Jev e Claude falharem', async () => {
    vi.stubEnv('OPENROUTER_JEV_PERCENT', '100');
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(''))
      .mockResolvedValueOnce(new Response('{"choices":[{"message":{"content":"continuidade"}}]}'));
    const body = { model: 'z-ai/glm-5.3', messages: [{ role: 'user', content: 'oi' }] };
    const response = await createJevRouterFetch(fetchImpl)(...request(body));
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(JSON.parse(fetchImpl.mock.calls[2][1].body)).toEqual(body);
    expect((await response.json()).choices[0].message.content).toBe('continuidade');
  });
});
