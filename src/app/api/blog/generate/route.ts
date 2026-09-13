export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { start } from 'workflow/api';
import { claimBlogRunToday, markAlertedIfFirstFailureToday } from '@/lib/blog/supabase-blog';
import { sendFailureAlertEmail } from '@/lib/blog/alert';
import { generateArticleWorkflow } from '@/workflows/generate-article';

// REGRESSÃO 13/09/2026: migração para Vercel Workflow DevKit (mesma causa raiz
// já corrigida no cfgauss-site e no gaussmob-nextjs/mova-nextjs). O
// Promise.race(runPipeline(), deadline) que existia aqui era um workaround
// manual contra o SIGKILL da Vercel em maxDuration=800s — o próprio comentário
// do código admitia que ele "não cancela o perdedor". 3 incidentes reais de
// pipeline_deadline_exceeded (27/08, 01/09, 02/09, depois recorrente quase
// toda semana de setembro). A rota agora só reivindica o dia (claim atômico,
// mesma lógica de sempre) e dispara start() — responde em milissegundos, sem
// teto de tempo artificial. O pipeline inteiro (steps com retry/cache
// próprios) roda fora desta invocação HTTP.

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

  // Claim atômico antes de qualquer chamada externa: evita publicação duplicada
  // quando cron/manual chegam quase simultaneamente.
  const claim = await claimBlogRunToday();
  if (claim === 'already_run') {
    return NextResponse.json({ message: 'already_run_today' }, { status: 200 });
  }
  if (claim === 'error') {
    // Claim falhou por infra (RPC ausente/secret/transitório): NUNCA responder 200 aqui —
    // senão o cron da Vercel marca como sucesso, não re-tenta e o dia fica sem artigo em silêncio.
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
