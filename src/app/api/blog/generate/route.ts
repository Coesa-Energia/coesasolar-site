export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { start } from 'workflow/api';
import { claimBlogRunToday, markAlertedIfFirstFailureToday } from '@/lib/blog/supabase-blog';
import { sendFailureAlertEmail } from '@/lib/blog/alert';
import { generateArticleWorkflow } from '@/workflows/generate-article';


async function alertOnFirstFailureToday(errorMsg: string): Promise<void> {
  const isFirstFailureToday = await markAlertedIfFirstFailureToday().catch(() => false);
  if (isFirstFailureToday) {
    const runDate = new Date().toISOString().slice(0, 10);
    await sendFailureAlertEmail({ keyword: undefined, error: errorMsg, runDate }).catch(() => {});
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? '';
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const claim = await claimBlogRunToday();
  if (claim === 'already_run') {
    return NextResponse.json({ message: 'already_run_today' }, { status: 200 });
  }
  if (claim === 'error') {
    await alertOnFirstFailureToday('claim_failed');
    return NextResponse.json({ error: 'claim_failed' }, { status: 500 });
  }

  try {
    const run = await start(generateArticleWorkflow, []);
    return NextResponse.json({ ok: true, runId: run.runId }, { status: 202 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[blog/generate] Crash ao disparar workflow:', errorMsg);
    await alertOnFirstFailureToday(errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
