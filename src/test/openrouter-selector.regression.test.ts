import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// 03/10/2026: o seletor de LLM do AI Gym, as telas de configuração e as Edge Functions
// que este arquivo inspecionava foram removidos (código herdado do Lovable, nunca
// publicado no projeto Supabase atual). As regras que continuam valendo passam a
// varrer todo o src/ — mais forte que a lista fixa de arquivos de antes.
const SELF = path.join('src', 'test', 'openrouter-selector.regression.test.ts');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.(tsx?|jsx?|mjs)$/.test(e.name) && p !== SELF ? [p] : [];
  });
}

const files = sourceFiles('src').map((f) => ({ f, src: fs.readFileSync(f, 'utf8') }));

describe('LLM custom provider routing', () => {
  it('nenhum código chama OpenAI/DeepSeek direto (só via OpenRouter)', () => {
    const hits = files.filter(({ src }) => /https:\/\/api\.(openai|deepseek)\.com\/v1/.test(src)).map(({ f }) => f);
    expect(hits).toEqual([]);
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
