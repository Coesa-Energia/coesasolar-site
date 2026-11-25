import { timingSafeEqual } from 'node:crypto';
import { getServiceClient } from '@/lib/blog/supabase-blog';

export const dynamic = 'force-dynamic';

const timeZone = 'America/Sao_Paulo';
const localDateTime = new Intl.DateTimeFormat('sv-SE', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function isAuthorized(request: Request): boolean {
  const token = process.env.COESA_BLOG_OBSERVATION_TOKEN;
  if (!token) return false;
  const expected = Buffer.from(`Bearer ${token}`);
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function parseTimestamp(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/.test(value)) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value ? date : null;
}

function closedDay(params: URLSearchParams) {
  const start = parseTimestamp(params.get('start'));
  const end = parseTimestamp(params.get('end'));
  if (!start || !end || end <= start || end.getTime() > Date.now()) return null;
  const localStart = localDateTime.format(start);
  if (!/^\d{4}-\d{2}-\d{2} 00:00:00$/.test(localStart)) return null;
  const date = localStart.slice(0, 10);
  const tomorrow = new Date(`${date}T00:00:00.000Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (localDateTime.format(end) !== `${tomorrow.toISOString().slice(0, 10)} 00:00:00`) return null;
  return { date, time_zone: timeZone, start: start.toISOString(), end_exclusive: end.toISOString() };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return reply({ error: 'unauthorized' }, 401);
  const window = closedDay(new URL(request.url).searchParams);
  if (!window) return reply({ error: 'invalid_window' }, 400);

  try {
    const supabase = getServiceClient();
    const runDatesUtc = [window.start.slice(0, 10), window.end_exclusive.slice(0, 10)];
    const [run, article] = await Promise.all([
      supabase.from('coesa_blog_run_log').select('status,created_at')
        .in('run_date', runDatesUtc).gte('created_at', window.start).lt('created_at', window.end_exclusive).maybeSingle(),
      supabase.from('coesa_articles').select('slug,published_at')
        .eq('status', 'published').gte('published_at', window.start).lt('published_at', window.end_exclusive).maybeSingle(),
    ]);
    if (run.error || article.error) return reply({ error: 'source_unavailable' }, 503);
    return reply({
      schema: 'coesa-autoblog-observation:1',
      window,
      run: run.data ? { status: run.data.status, created_at: run.data.created_at } : null,
      article: article.data ? { slug: article.data.slug, published_at: article.data.published_at } : null,
    });
  } catch {
    return reply({ error: 'source_unavailable' }, 503);
  }
}
