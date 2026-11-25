import { google } from 'googleapis';
import { FatalError } from 'workflow';
import { AUTOBLOG_PROFILE } from '@/lib/autoblog-profile';
import { getNextSeedKeyword, SEED_KEYWORDS } from './seed-keywords';

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Seed do dia pulando temas já publicados — não repetir artigo a cada N dias. */
export function getSeedSkippingPublished(existingKeywords: string[], dayOfYear = getDayOfYear()): string | undefined {
  const published = new Set(existingKeywords.map(k => k.toLowerCase()));
  for (let i = 0; i < SEED_KEYWORDS.length; i++) {
    const candidate = getNextSeedKeyword(dayOfYear + i);
    if (!published.has(candidate.toLowerCase())) return candidate;
  }
  return undefined;
}

type SearchAnalyticsRow = {
  keys?: string[] | null;
  position?: number | null;
  impressions?: number | null;
};

/** Melhor consulta inédita entre as posições com oportunidade editorial (4–30). */
export function pickTopEligibleGscKeyword(
  rows: SearchAnalyticsRow[],
  existingKeywords: string[],
): string | undefined {
  const existingSet = new Set(existingKeywords.map(k => k.toLowerCase()));
  return rows
    .filter(r => {
      const position = r.position ?? 0;
      const query = r.keys?.[0]?.trim() ?? '';
      return position >= 4 && position <= 30 && query !== '' && !existingSet.has(query.toLowerCase());
    })
    .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))[0]
    ?.keys?.[0]?.trim();
}

function summarizeGscFailure(error: unknown): { reason: 'invalid_grant' | 'request_failed'; status?: number } {
  const response = error && typeof error === 'object' && 'response' in error ? error.response : null;
  const data = response && typeof response === 'object' && 'data' in response ? response.data : null;
  const providerCode = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
    ? data.error
    : undefined;
  const responseStatus = response && typeof response === 'object' && 'status' in response ? response.status : null;
  const status = typeof responseStatus === 'number' && Number.isInteger(responseStatus)
    && responseStatus >= 400 && responseStatus <= 599 ? responseStatus : undefined;
  const code = providerCode ?? (error instanceof Error ? error.message : undefined);
  return { reason: code === 'invalid_grant' ? 'invalid_grant' : 'request_failed', status };
}

type GscKeywordReading =
  | { state: 'eligible'; keyword: string }
  | { state: 'disabled' | 'no_eligible' }
  | { state: 'unconfigured'; missing: string[] }
  | { state: 'invalid_grant' | 'request_failed'; status?: number };

export async function readGscKeyword(existingKeywords: string[], signal?: AbortSignal): Promise<GscKeywordReading> {
  if (!AUTOBLOG_PROFILE.integrations.googleSearchConsoleEnabled) {
    return { state: 'disabled' };
  }

  const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'].filter(
    k => !process.env[k],
  );
  if (missing.length > 0) return { state: 'unconfigured', missing };

  try {
    const auth = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      ...(signal && { transporterOptions: { signal } }),
    });
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const res = await searchconsole.searchanalytics.query({
      siteUrl: `sc-domain:${new URL(AUTOBLOG_PROFILE.brand.siteUrl).hostname}`,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 200,
        // ATENÇÃO: position NÃO é filtrável via dimensionFilterGroups
        // É uma métrica de row, não uma dimensão. Filtrar no código abaixo.
      },
    }, { signal });

    const keyword = pickTopEligibleGscKeyword(res.data.rows ?? [], existingKeywords);
    return keyword ? { state: 'eligible', keyword } : { state: 'no_eligible' };
  } catch (err) {
    const { reason, status } = summarizeGscFailure(err);
    return { state: reason, status };
  }
}

export async function fetchTopKeyword(existingKeywords: string[]): Promise<string | undefined> {
  const reading = await readGscKeyword(existingKeywords);
  if (reading.state === 'eligible') return reading.keyword;

  const seed = getSeedSkippingPublished(existingKeywords);
  if (reading.state === 'unconfigured') {
    console.warn(`[gsc] Flag ligada mas envs ausentes: ${reading.missing.join(', ')}. Usando seed fallback.`);
  }
  if (reading.state === 'invalid_grant' || reading.state === 'request_failed') {
    console.warn('[gsc] Search Console indisponível:', reading.state, reading.status);
    if (!seed && reading.state === 'invalid_grant') throw new FatalError('gsc_invalid_grant_no_keyword');
  }
  return seed;
}
