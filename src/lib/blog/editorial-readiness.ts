import { getAvailableEditorialReserves } from './editorial-calendar';
import { readGscKeyword } from './gsc';
import { getPublishedKeywords } from './supabase-blog';

export async function recordEditorialReadiness(): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  const minimumReserve = 5;
  try {
    const existingKeywords = await getPublishedKeywords(controller.signal).catch(() => null);
    if (!existingKeywords) {
      console.warn('[blog/editorial-readiness]', { searchConsole: 'history_unavailable', reserveReady: null, minimumReserve });
      return;
    }

    const [gsc, reserve] = await Promise.allSettled([
      readGscKeyword(existingKeywords, controller.signal),
      getAvailableEditorialReserves(existingKeywords, controller.signal),
    ]);
    const searchConsole = gsc.status === 'fulfilled' ? gsc.value.state : 'request_failed';
    const reserveReady = reserve.status === 'fulfilled' ? reserve.value.length : null;
    const evidence = { searchConsole, reserveReady, minimumReserve };
    if (searchConsole !== 'eligible' || reserveReady === null || reserveReady < minimumReserve) {
      console.warn('[blog/editorial-readiness]', evidence);
    } else {
      console.info('[blog/editorial-readiness]', evidence);
    }
  } finally {
    clearTimeout(timeout);
  }
}
