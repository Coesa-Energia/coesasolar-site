import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  buildByokChatBody,
  BYOK_MODELS,
  BYOK_PROVIDER,
  createByokFetch,
  validateByokResponse,
} from '@/lib/ai/byok';

// 03/10/2026: o seletor de LLM do AI Gym, as telas de configuração e as Edge Functions
// que este arquivo inspecionava foram removidos (código herdado do Lovable, nunca
// publicado no projeto Supabase atual). As regras que continuam valendo passam a
// varrer todo o src/ — mais forte que a lista fixa de arquivos de antes.
const SELF = path.join('src', 'test', 'openrouter-selector.regression.test.ts');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (p.includes('/.well-known/workflow/')) return [];
    if (e.isDirectory()) return sourceFiles(p);
    return /\.(tsx?|jsx?|mjs)$/.test(e.name) && p !== SELF ? [p] : [];
  });
}

const files = sourceFiles('src').map((f) => ({ f, src: fs.readFileSync(f, 'utf8') }));

describe('LLM custom provider routing', () => {
  it('routes paid text through OpenAI BYOK then Anthropic BYOK', () => {
    expect(buildByokChatBody({ model: 'legacy', temperature: 0.7, messages: [] }, 'quality')).toEqual({
      models: [...BYOK_MODELS.quality],
      provider: BYOK_PROVIDER,
      usage: { include: true },
      messages: [],
    });
  });

  it.each([undefined, false])('fails closed when BYOK proof is %s', async (isByok) => {
    const response = new Response(JSON.stringify({ usage: { is_byok: isByok } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const validated = await validateByokResponse(response);

    expect(validated.status).toBe(502);
  });

  it('fails closed when OpenRouter returns a model outside the requested BYOK tier', async () => {
    const response = new Response(JSON.stringify({
      model: 'google/gemini-3-flash',
      usage: { is_byok: true },
    }), { status: 200 });

    const validated = await validateByokResponse(response, BYOK_MODELS.fast);

    expect(validated.status).toBe(502);
    await expect(validated.json()).resolves.toMatchObject({ error: { code: 'BYOK_MODEL_MISMATCH' } });
  });

  it('rewrites SDK requests before they reach OpenRouter', async () => {
    const transport = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      model: BYOK_MODELS.quality[0],
      usage: { is_byok: true },
    }), { status: 200 }));
    const request = createByokFetch('quality', transport);

    const response = await request('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ model: 'legacy', temperature: 0.7, messages: [] }),
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(String(transport.mock.calls[0]?.[1]?.body))).toEqual({
      models: [...BYOK_MODELS.quality],
      provider: BYOK_PROVIDER,
      usage: { include: true },
      messages: [],
    });
  });

  it('nenhum código chama OpenAI/DeepSeek direto (só via OpenRouter)', () => {
    const hits = files.filter(({ src }) => /https:\/\/api\.(openai|deepseek)\.com\/v1/.test(src)).map(({ f }) => f);
    expect(hits).toEqual([]);
  });

  it('keeps every paid text caller behind the BYOK transport', () => {
    const constructors = files.filter(({ src }) => src.includes('new OpenAI(')).map(({ f }) => f);
    expect(constructors).toEqual([path.join('src', 'lib', 'ai', 'byok.ts')]);

    for (const file of [
      'src/lib/blog/deepseek.ts',
      'src/lib/blog/quality-gate.ts',
      'src/app/api/ai/health/route.ts',
    ]) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).toMatch(/createByokClient|buildByokChatBody/);
      expect(source).toMatch(/validateByokResponse|createByokClient/);
    }
  });

  it('keeps executable Supabase URLs on the active CoesaSolar project', () => {
    const hits = files.filter(({ src }) => src.includes('cvcdweqybgfxywcelriq.supabase.co')).map(({ f }) => f);
    expect(hits).toEqual([]);
  });

  it('keeps executable public URLs on the active CoesaSolar domain', () => {
    const hits = files.filter(({ src }) => /\.lovable\.app|lovableproject\.com/.test(src)).map(({ f }) => f);
    expect(hits).toEqual([]);
    expect(fs.readFileSync('src/hooks/useConfiguracoes.ts', 'utf8')).toContain('coesasolar.com.br');
  });
});
