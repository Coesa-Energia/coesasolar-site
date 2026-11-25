import { revalidatePath } from 'next/cache';
import { FatalError } from 'workflow';
import {
  claimBlogRunToday,
  insertArticle,
  insertRunLog,
  getPublishedKeywords,
  getLinkCandidates,
  markAlertedIfFirstFailureToday,
} from '@/lib/blog/supabase-blog';
import { sendFailureAlertEmail } from '@/lib/blog/alert';
import { getAvailableEditorialReserves, getNextPlannedEntry, markPublished, saveOutlineStructure, type EditorialBrief } from '@/lib/blog/editorial-calendar';
import { fetchTopKeyword } from '@/lib/blog/gsc';
import {
  generateArticleStructure,
  writeSection,
  enrichSectionBriefs,
  buildArticleFromSections,
  assembleArticleMarkdown,
  regenerateSectionsWithFeedback,
  injectSectionImages,
  fixSimpleValidationIssues,
  type ArticleContent,
  type ArticleStructure,
  type ArticleWithSections,
  type InternalLink,
} from '@/lib/blog/deepseek';
import { generateAndUploadCover, generateAndUploadBodyImages, generateAndUploadInfographic } from '@/lib/blog/image-gen';
import { injectInfographic, injectInlineCtas, type InlineCta } from '@/lib/blog/image-body';
import { countArticleWords, MIN_ACCEPTABLE_ARTICLE_WORDS, MIN_ARTICLE_WORDS, validateArticle } from '@/lib/blog/validate';
import { runQualityGateLoop, type QualityGateResult, type JudgeIssue } from '@/lib/blog/quality-gate';
import { checkOpenRouterBalance } from '@/lib/blog/openrouter-budget';
import { scoreInternalLinks } from '@/lib/blog/internal-links';
import { distributeArticle, buildDistributionArticle } from '@/lib/blog/distribution';
import { AUTOBLOG_PROFILE } from '@/lib/autoblog-profile';

export type GenerateArticleResult = { slug: string | null; warnings?: string[]; error?: string };


export async function checkBalanceStep(): Promise<void> {
  'use step';
  const balance = await checkOpenRouterBalance();
  if (!balance.ok) {
    throw new Error(`openrouter_balance_low:$${balance.remaining?.toFixed(2)}`);
  }
}

export async function resolveKeywordAndBriefStep(): Promise<{ keyword: string; brief: EditorialBrief | null }> {
  'use step';
  try {
    const planned = await getNextPlannedEntry();
    if (planned?.keyword) return { keyword: planned.keyword, brief: planned };
  } catch (err) {
    console.warn('[workflow/generate-article] Calendário indisponível:', err);
  }

  const existingKeywords = await getPublishedKeywords();
  let rejectedGrant: FatalError | undefined;
  try {
    const keyword = await fetchTopKeyword(existingKeywords);
    if (keyword) return { keyword, brief: null };
  } catch (error) {
    if (!(error instanceof FatalError) || error.message !== 'gsc_invalid_grant_no_keyword') throw error;
    rejectedGrant = error;
  }

  const [reserve] = await getAvailableEditorialReserves(existingKeywords);
  if (reserve) return { keyword: reserve.keyword, brief: reserve };
  throw rejectedGrant ?? new Error('keyword_not_resolved');
}

async function resolveInternalLinksStep(keyword: string): Promise<InternalLink[]> {
  'use step';
  const profileLinks: InternalLink[] = AUTOBLOG_PROFILE.editorial.internalLinks.map(l => ({
    label: l.label,
    url: l.url,
  }));
  let dynamicLinks: InternalLink[] = [];
  try {
    const profileUrls = new Set(profileLinks.map(l => l.url));
    dynamicLinks = scoreInternalLinks(keyword, await getLinkCandidates())
      .filter(l => !profileUrls.has(l.url));
  } catch (err) {
    console.warn('[workflow/generate-article] Interlinkagem indisponível:', err);
  }
  return [...profileLinks, ...dynamicLinks];
}

export async function generateStructureStep(
  keyword: string,
  internalLinks: InternalLink[],
  brief: EditorialBrief | null,
): Promise<ArticleStructure> {
  'use step';
  const rawStructure = await generateArticleStructure(keyword, internalLinks, brief);
  const structure: ArticleStructure = {
    ...rawStructure,
    sections: enrichSectionBriefs(rawStructure.sections, keyword, internalLinks),
  };
  await saveOutlineStructure(keyword, JSON.stringify(structure)).catch(() => {});
  return structure;
}
generateStructureStep.maxRetries = 0;

export async function writeSectionStep(
  keyword: string,
  section: ArticleStructure['sections'][number],
  index: number,
  total: number,
): Promise<string> {
  'use step';
  return writeSection(keyword, section, index, total);
}
writeSectionStep.maxRetries = 1;

async function generateCoverStep(prompt: string, slug: string): Promise<string | null> {
  'use step';
  return generateAndUploadCover(prompt, slug);
}

async function generateBodyImagesStep(prompts: string[], slug: string, keyword: string): Promise<Array<{ url: string; alt: string } | null>> {
  'use step';
  return generateAndUploadBodyImages(prompts, slug, keyword);
}

async function generateInfographicStep(prompt: string, slug: string): Promise<string | null> {
  'use step';
  return generateAndUploadInfographic(prompt, slug);
}

export async function qualityGateAndPublishStep(
  keyword: string,
  article: ArticleWithSections,
  contentWithCtas: string,
  coverUrl: string | null,
  sectionImages: Array<{ url: string; alt: string } | null>,
  infographicUrl: string | null,
  cta: InlineCta | null,
): Promise<{ slug: string; warnings: string[] } | { error: string }> {
  'use step';
  type GateContent = { article: ArticleWithSections; content: string };

  const regenerateWithIssues = async ({ article: a }: GateContent, issues: JudgeIssue[]): Promise<GateContent> => {
    const newBodies = await regenerateSectionsWithFeedback(keyword, a.structure, a.bodies, issues);
    const newContent = assembleArticleMarkdown(a.structure, newBodies);
    const revised = { ...a, bodies: newBodies, content: newContent };
    const regenBody = injectSectionImages(newContent, sectionImages);
    const regenWithInfographic = injectInfographic(
      regenBody,
      infographicUrl ? { url: infographicUrl, alt: `${keyword} — infográfico` } : null,
    );
    return { article: revised, content: injectInlineCtas(regenWithInfographic, cta) };
  };

  const gateResult = await runQualityGateLoop<GateContent>(
    { article, content: contentWithCtas },
    ({ article: a, content }) => `# ${a.title}\n\nMeta description: ${a.meta_desc}\n\n${content}`,
    (content, issues) => {
      console.warn('[workflow/generate-article] Quality gate abaixo de 90 — regenerando:', issues);
      return regenerateWithIssues(content, issues);
    },
  );

  let finalContent = gateResult.content;
  if (!gateResult.judged.skipped) {
    console.warn(`[workflow/generate-article] Quality gate score final: ${gateResult.judged.score}`);
  }

  let finalWordCount = countArticleWords(finalContent.content);
  if (finalWordCount < MIN_ACCEPTABLE_ARTICLE_WORDS) {
    console.warn(`[workflow/generate-article] Artigo com ${finalWordCount} palavras (piso ${MIN_ACCEPTABLE_ARTICLE_WORDS}) — regenerando com pedido de expansão.`);
    const expandAllSections: JudgeIssue[] = finalContent.article.structure.sections.map(s => ({
      severity: 'P0',
      category: 'content_quality',
      section: s.h2,
      problem: `Artigo com ${finalWordCount} palavras no total, abaixo do piso de ${MIN_ACCEPTABLE_ARTICLE_WORDS}.`,
      fix_instruction: `Expanda esta seção com mais profundidade, exemplos e detalhes práticos — contribua para o artigo somar pelo menos ${MIN_ARTICLE_WORDS} palavras no total, sem redundância nem enrolação.`,
    }));
    finalContent = await regenerateWithIssues(finalContent, expandAllSections);
    finalWordCount = countArticleWords(finalContent.content);
  }

  const finalArticle = finalContent.article;
  const finalContentWithCtas = finalContent.content;
  const warnings: string[] = [];
  if (finalWordCount < MIN_ACCEPTABLE_ARTICLE_WORDS) {
    const warning = `article_below_${MIN_ACCEPTABLE_ARTICLE_WORDS}_words:${finalWordCount}`;
    console.warn(`[workflow/generate-article] Publicando mesmo assim com ${finalWordCount} palavras (piso ${MIN_ACCEPTABLE_ARTICLE_WORDS}) — piso de palavras não bloqueia mais publicação.`);
    warnings.push(warning);
  }

  const finalSlug = await insertArticle({
    slug: finalArticle.slug,
    title: finalArticle.title,
    page_title: finalArticle.page_title ?? null,
    meta_desc: finalArticle.meta_desc,
    content: finalContentWithCtas,
    cover_url: coverUrl,
    cover_alt: finalArticle.cover_alt ?? null,
    keyword,
    category: finalArticle.category ?? null,
  });

  await insertRunLog({ keyword, status: 'success' });

  return { slug: finalSlug, warnings };
}
qualityGateAndPublishStep.maxRetries = 0;

async function markPublishedStep(keyword: string, slug: string): Promise<void> {
  'use step';
  await markPublished(keyword, slug);
}

async function revalidateStep(slug: string, category: string | null | undefined): Promise<void> {
  'use step';
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/sitemap.xml');
  if (category) revalidatePath(`/categoria/${category}`);
}

async function distributeStep(
  article: { title: string; page_title: string | null; keyword: string },
  slug: string,
): Promise<void> {
  'use step';
  const distConfig = AUTOBLOG_PROFILE.integrations.distribution;
  if (!distConfig.enabled || distConfig.channels.length === 0) return;
  try {
    const results = await distributeArticle(
      buildDistributionArticle({
        title: article.title,
        pageTitle: article.page_title,
        slug,
        metaDesc: '',
        keyword: article.keyword,
      }),
      [...distConfig.channels],
    );
    for (const result of results) {
      if (!result.ok) {
        console.warn(`[workflow/generate-article] Divulgação '${result.channel}' falhou:`, result.error);
      }
    }
  } catch (err) {
    console.warn('[workflow/generate-article] Divulgação indisponível:', err);
  }
}

export async function recordFailureStep(keyword: string | undefined, errorMsg: string): Promise<void> {
  'use step';
  await insertRunLog({ keyword, status: 'error', error: errorMsg }).catch(() => {});
  const isFirstFailureToday = await markAlertedIfFirstFailureToday().catch(() => false);
  if (isFirstFailureToday) {
    const runDate = new Date().toISOString().slice(0, 10);
    await sendFailureAlertEmail({ keyword, error: errorMsg, runDate }).catch(() => {});
  }
}


export async function generateArticleWorkflow(): Promise<GenerateArticleResult> {
  'use workflow';

  let keyword: string | undefined;

  try {
    await checkBalanceStep();

    const resolved = await resolveKeywordAndBriefStep();
    keyword = resolved.keyword;
    const kw = resolved.keyword;

    const internalLinks = await resolveInternalLinksStep(kw);

    const structure = await generateStructureStep(kw, internalLinks, resolved.brief);
    const bodies = await Promise.all(
      structure.sections.map((section, index) =>
        writeSectionStep(kw, section, index, structure.sections.length),
      ),
    );
    let article = buildArticleFromSections(structure, bodies);

    const validate = (a: ArticleContent) =>
      validateArticle({
        keyword: kw,
        title: a.title,
        pageTitle: a.page_title ?? null,
        metaDesc: a.meta_desc,
        content: a.content,
        siteUrl: AUTOBLOG_PROFILE.brand.siteUrl,
        ctaUrl: AUTOBLOG_PROFILE.cta.url,
        coverAlt: a.cover_alt ?? null,
        category: a.category ?? null,
        allowedCategories: AUTOBLOG_PROFILE.editorial.categories.map(c => c.slug),
      });
    let report = validate(article);
    if (!report.ok) {
      console.warn('[workflow/generate-article] Checklist on-page falhou — aplicando fix determinístico:', report.issues);
      article = { ...article, ...fixSimpleValidationIssues(article, kw, report.issues.map(i => i.rule)) };
      report = validate(article);
    }
    const warnings = report.ok ? [] : report.issues;

    const coverUrl = await generateCoverStep(article.image_prompt, article.slug);
    const sectionImages = await generateBodyImagesStep(article.sectionImagePrompts, article.slug, kw);
    const contentWithImages = injectSectionImages(article.content, sectionImages);

    const infographicUrl = await generateInfographicStep(article.image_prompt, article.slug);
    const contentWithInfographic = injectInfographic(
      contentWithImages,
      infographicUrl ? { url: infographicUrl, alt: `${kw} — infográfico` } : null,
    );

    const cta = AUTOBLOG_PROFILE.cta.url.trim() ? AUTOBLOG_PROFILE.cta : null;
    const contentWithCtas = injectInlineCtas(contentWithInfographic, cta);

    const published = await qualityGateAndPublishStep(kw, article, contentWithCtas, coverUrl, sectionImages, infographicUrl, cta);
    if ('error' in published) {
      await recordFailureStep(kw, published.error);
      return { slug: null, error: published.error };
    }

    try {
      await markPublishedStep(kw, published.slug);
      await revalidateStep(published.slug, article.category);
      await distributeStep({ title: article.title, page_title: article.page_title ?? null, keyword: kw }, published.slug);
    } catch (err) {
      console.warn('[workflow/generate-article] Passo pós-publicação falhou (artigo já está no ar, não bloqueia):', err);
    }

    if (warnings.length) {
      console.warn('[workflow/generate-article] Publicado com ressalvas do checklist:', warnings);
    }

    return { slug: published.slug, warnings: [...warnings.map(w => w.message), ...published.warnings] };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[workflow/generate-article] Pipeline falhou:', errorMsg);
    await recordFailureStep(keyword, errorMsg);
    return { slug: null, error: errorMsg };
  }
}
