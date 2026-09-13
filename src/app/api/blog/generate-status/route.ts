export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRun } from 'workflow/api';
import type { GenerateArticleResult } from '@/workflows/generate-article';

/**
 * Consulta o status/resultado de um run disparado por blog/generate (ver
 * workflows/generate-article.ts). Mesmo padrão do cfgauss-site/gaussmob-nextjs.
 * Sem crons de polling — vercel.json dispara generate fire-and-forget; esta
 * rota é só pra inspeção manual/debug.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? '';
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const runId = request.nextUrl.searchParams.get('runId');
  if (!runId) {
    return NextResponse.json({ error: 'runId ausente' }, { status: 400 });
  }

  const run = getRun<GenerateArticleResult>(runId);
  const status = await run.status;

  if (status !== 'completed' && status !== 'failed') {
    return NextResponse.json({ runId, status });
  }

  try {
    const result = await run.returnValue;
    return NextResponse.json({ runId, status, slug: result?.slug ?? null, error: result?.error, warnings: result?.warnings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ runId, status, error: msg });
  }
}
