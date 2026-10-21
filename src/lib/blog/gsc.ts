// src/lib/blog/gsc.ts
import { google } from 'googleapis';
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

export async function fetchTopKeyword(existingKeywords: string[]): Promise<string | undefined> {
  if (!AUTOBLOG_PROFILE.integrations.googleSearchConsoleEnabled) {
    return getSeedSkippingPublished(existingKeywords);
  }

  // Flag ligada sem credenciais: falha em silêncio = debug impossível. Diagnóstico claro.
  const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'].filter(
    k => !process.env[k],
  );
  if (missing.length > 0) {
    console.warn(`[gsc] Flag ligada mas envs ausentes: ${missing.join(', ')}. Usando seed fallback.`);
    return getSeedSkippingPublished(existingKeywords);
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
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
    });

    const keyword = pickTopEligibleGscKeyword(res.data.rows ?? [], existingKeywords);
    if (keyword) return keyword;
  } catch (err) {
    console.warn('[gsc] GSC falhou, usando seed fallback:', err);
  }

  return getSeedSkippingPublished(existingKeywords);
}
