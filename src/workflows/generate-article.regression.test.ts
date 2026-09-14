// Testa os steps do workflow DIRETAMENTE, sem bundler: "use step"/"use
// workflow" são strings literais sem efeito em runtime de teste — as
// funções são chamáveis como funções JS comuns (mesmo padrão documentado
// pelo Workflow DevKit: "Steps are just functions; without the compiler,
// 'use step' is a no-op. Test them directly").
//
// Estes testes substituem a cobertura que route.regression.test.ts tinha
// antes da migração pro Workflow DevKit (13/09/2026) — os invariantes de
// negócio (piso de palavras, alerta na 1ª falha do dia, circuit breaker de
// saldo) migraram da rota síncrona pra dentro do workflow, mas continuam
// sendo os MESMOS invariantes, testados com os MESMOS valores reais.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertArticle = vi.fn();
const insertRunLog = vi.fn();
const markAlertedIfFirstFailureToday = vi.fn();
vi.mock('@/lib/blog/supabase-blog', () => ({
  claimBlogRunToday: vi.fn(),
  insertArticle,
  insertRunLog,
  getPublishedKeywords: vi.fn(),
  getLinkCandidates: vi.fn(),
  markAlertedIfFirstFailureToday,
}));

const sendFailureAlertEmail = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/blog/alert', () => ({ sendFailureAlertEmail }));

const checkOpenRouterBalance = vi.fn();
vi.mock('@/lib/blog/openrouter-budget', () => ({ checkOpenRouterBalance }));

vi.mock('@/lib/blog/editorial-calendar', () => ({
  getNextPlannedEntry: vi.fn(),
  markPublished: vi.fn(),
  saveOutlineStructure: vi.fn(),
}));
vi.mock('@/lib/blog/gsc', () => ({ fetchTopKeyword: vi.fn() }));
const regenerateSectionsWithFeedback = vi.fn();
vi.mock('@/lib/blog/deepseek', () => ({
  generateArticleWithSections: vi.fn(),
  assembleArticleMarkdown: vi.fn(() => 'conteúdo regenerado'),
  regenerateSectionsWithFeedback,
  injectSectionImages: vi.fn((content: string) => content),
  fixSimpleValidationIssues: vi.fn((article: unknown) => article),
}));
vi.mock('@/lib/blog/image-gen', () => ({
  generateAndUploadCover: vi.fn(),
  generateAndUploadBodyImages: vi.fn(),
  generateAndUploadInfographic: vi.fn(),
}));
vi.mock('@/lib/blog/image-body', () => ({
  injectInfographic: vi.fn((content: string) => content),
  injectInlineCtas: vi.fn((content: string) => content),
}));

const countArticleWords = vi.fn(() => 5000);
vi.mock('@/lib/blog/validate', () => ({
  countArticleWords,
  MIN_ACCEPTABLE_ARTICLE_WORDS: 4050,
  MIN_ARTICLE_WORDS: 4500,
  validateArticle: vi.fn(() => ({ ok: true, issues: [] })),
}));

const runQualityGateLoop = vi.fn();
vi.mock('@/lib/blog/quality-gate', () => ({ runQualityGateLoop }));

vi.mock('@/lib/blog/internal-links', () => ({ scoreInternalLinks: vi.fn(() => []) }));
vi.mock('@/lib/blog/distribution', () => ({ distributeArticle: vi.fn(), buildDistributionArticle: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const { checkBalanceStep, qualityGateAndPublishStep, recordFailureStep } = await import('./generate-article');

const ARTICLE_STUB = {
  title: 'T', slug: 'slug-ok', meta_desc: 'M', image_prompt: 'p', content: 'conteúdo',
  structure: {
    sections: [{ h2: 'Seção 1' }, { h2: 'Seção 2' }],
    faq: [], summary_bullets: [], title: 'T', page_title: 'T', slug: 'slug-ok', meta_desc: 'M',
    cover_image_prompt: 'p', cover_alt: null, category: null,
  },
  bodies: [], sectionImagePrompts: [], cover_alt: null, category: null,
} as unknown as Parameters<typeof qualityGateAndPublishStep>[1];

describe('checkBalanceStep — circuit breaker de saldo (REGRESSÃO 02/09/2026)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saldo baixo: lança openrouter_balance_low com o valor restante', async () => {
    checkOpenRouterBalance.mockResolvedValue({ ok: false, remaining: 0.42 });
    await expect(checkBalanceStep()).rejects.toThrow('openrouter_balance_low:$0.42');
  });

  it('saldo ok: resolve sem lançar', async () => {
    checkOpenRouterBalance.mockResolvedValue({ ok: true, remaining: 50 });
    await expect(checkBalanceStep()).resolves.toBeUndefined();
  });
});

// REGRESSÃO 02/09/2026 (achado real em produção): o gate exigia o piso EXATO de 4500
// palavras contra um total que é SOMA de 7-9 seções escritas "sem contar palavra"
// (instrução deliberada — contar produz prosa artificialmente inchada). Achado real:
// artigo com 4421/4500 (1,8% abaixo) derrubado e descartado inteiro. Tolerância de 10%
// no gate de PUBLICAÇÃO — decisão do dono, preservada na migração.
describe('qualityGateAndPublishStep — tolerância de 10% no piso de palavras', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runQualityGateLoop.mockImplementation(async (initial: unknown) => ({
      content: initial,
      judged: { skipped: true, score: null, issues: [], categories: null },
      attempts: 0,
    }));
    insertArticle.mockResolvedValue('slug-ok');
    insertRunLog.mockResolvedValue(undefined);
    regenerateSectionsWithFeedback.mockResolvedValue([]);
  });

  it('4421 palavras (achado real, 1,8% abaixo de 4500) publica — dentro da tolerância', async () => {
    countArticleWords.mockReturnValueOnce(4421);
    const result = await qualityGateAndPublishStep('kw', ARTICLE_STUB, 'conteúdo', null, [], null, null);
    expect(result).toEqual({ slug: 'slug-ok', warnings: [] });
    expect(insertArticle).toHaveBeenCalled();
  });

  it('4050 palavras (exatamente 90% de 4500) publica — fronteira inclusiva', async () => {
    countArticleWords.mockReturnValueOnce(4050);
    const result = await qualityGateAndPublishStep('kw', ARTICLE_STUB, 'conteúdo', null, [], null, null);
    expect('slug' in result).toBe(true);
  });

  it('4049 palavras (1 abaixo da fronteira de 90%), sem melhora na regeneração extra, reprova — tolerância não é ilimitada', async () => {
    countArticleWords.mockReturnValueOnce(4049).mockReturnValueOnce(4049);
    const result = await qualityGateAndPublishStep('kw', ARTICLE_STUB, 'conteúdo', null, [], null, null);
    expect(result).toEqual({ error: 'article_below_4050_words:4049' });
    expect(insertArticle).not.toHaveBeenCalled();
  });
});

// REGRESSÃO 14/09/2026 (achado real em produção: 3826/4050): o gate de qualidade por LLM
// (runQualityGateLoop) nunca avalia tamanho — só pontua conteúdo/SEO/E-E-A-T/técnico/GEO.
// Antes deste fix, um artigo podia passar no gate de qualidade e ainda assim reprovar
// direto no piso de palavras, sem NUNCA tentar corrigir o próprio motivo da reprovação.
describe('qualityGateAndPublishStep — retry de tamanho quando o gate de qualidade passa mas o artigo sai curto (REGRESSÃO 14/09/2026)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runQualityGateLoop.mockImplementation(async (initial: unknown) => ({
      content: initial,
      judged: { skipped: true, score: null, issues: [], categories: null },
      attempts: 0,
    }));
    insertArticle.mockResolvedValue('slug-ok');
    insertRunLog.mockResolvedValue(undefined);
    regenerateSectionsWithFeedback.mockResolvedValue([]);
  });

  it('artigo curto dispara UMA regeneração extra e publica se ela corrigir', async () => {
    countArticleWords.mockReturnValueOnce(3826).mockReturnValueOnce(4200);
    const result = await qualityGateAndPublishStep('kw', ARTICLE_STUB, 'conteúdo', null, [], null, null);
    expect(regenerateSectionsWithFeedback).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ slug: 'slug-ok', warnings: [] });
  });

  // REGRESSÃO 14/09/2026 (2ª rodada — achado real de produção 3902/4050, DEPOIS do fix
  // acima já estar no ar): regenerateSectionsWithFeedback só regenera seções cujo
  // `issue.section` bate EXATAMENTE com um h2 da estrutura (findIndex por igualdade) — a
  // 1ª versão deste fix mandava `section: 'geral'`, que não casa com NENHUM h2 real; a
  // regeneração virava no-op silencioso (currentBodies inalterado) e o artigo continuava
  // curto. Esta issue trava que as issues sintéticas usam os h2 REAIS da estrutura.
  it('a issue sintética de expansão usa os h2 REAIS da estrutura, não um rótulo genérico', async () => {
    countArticleWords.mockReturnValueOnce(3826).mockReturnValueOnce(4200);
    await qualityGateAndPublishStep('kw', ARTICLE_STUB, 'conteúdo', null, [], null, null);
    const issuesPassadas = regenerateSectionsWithFeedback.mock.calls[0]?.[3];
    expect(issuesPassadas).toHaveLength(2);
    expect(issuesPassadas.map((i: { section: string }) => i.section)).toEqual(['Seção 1', 'Seção 2']);
  });

  it('se a regeneração extra ainda sair curta, reprova — não tenta infinitamente', async () => {
    countArticleWords.mockReturnValueOnce(3826).mockReturnValueOnce(3900);
    const result = await qualityGateAndPublishStep('kw', ARTICLE_STUB, 'conteúdo', null, [], null, null);
    expect(regenerateSectionsWithFeedback).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ error: 'article_below_4050_words:3900' });
  });

  it('artigo já dentro do piso NÃO dispara regeneração extra', async () => {
    countArticleWords.mockReturnValueOnce(4200);
    const result = await qualityGateAndPublishStep('kw', ARTICLE_STUB, 'conteúdo', null, [], null, null);
    expect(regenerateSectionsWithFeedback).not.toHaveBeenCalled();
    expect(result).toEqual({ slug: 'slug-ok', warnings: [] });
  });
});

// REGRESSÃO 02/09/2026: falha só ficava visível no relatório do Sentinel do dia SEGUINTE.
// markAlertedIfFirstFailureToday é atômico: só true na 1ª falha do dia — retries de cron
// subsequentes no mesmo dia não devem reenviar o alerta.
describe('recordFailureStep — alerta em tempo real na 1ª falha do dia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertRunLog.mockResolvedValue(undefined);
  });

  it('1ª falha do dia (RPC devolve true): dispara o alerta com o erro e a keyword certos', async () => {
    markAlertedIfFirstFailureToday.mockResolvedValue(true);
    await recordFailureStep('energia solar teste', 'deepseek_structure_failed');
    expect(sendFailureAlertEmail).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: 'energia solar teste', error: 'deepseek_structure_failed' }),
    );
  });

  it('falha subsequente no mesmo dia (RPC devolve false): NÃO reenvia o alerta', async () => {
    markAlertedIfFirstFailureToday.mockResolvedValue(false);
    await recordFailureStep('energia solar teste', 'outro erro');
    expect(sendFailureAlertEmail).not.toHaveBeenCalled();
  });

  it('sempre grava insertRunLog com status error, mesmo antes de saber se é a 1ª falha', async () => {
    markAlertedIfFirstFailureToday.mockResolvedValue(false);
    await recordFailureStep('energia solar teste', 'algum erro');
    expect(insertRunLog).toHaveBeenCalledWith({ keyword: 'energia solar teste', status: 'error', error: 'algum erro' });
  });
});
