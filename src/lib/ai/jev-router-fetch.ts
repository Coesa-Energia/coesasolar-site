export const JEV_ROUTER_MODEL = 'typesafe/jev-router';

type JevCostTier = 'low' | 'medium' | 'high';

function canaryPercent(): number {
  const raw = process.env.OPENROUTER_JEV_PERCENT?.trim();
  if (!raw) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('OPENROUTER_JEV_PERCENT must be a number between 0 and 100');
  }
  return value;
}

function costTier(): JevCostTier {
  const value = process.env.OPENROUTER_JEV_COST_TIER?.trim() || 'low';
  if (value !== 'low' && value !== 'medium' && value !== 'high') {
    throw new Error('OPENROUTER_JEV_COST_TIER must be low, medium, or high');
  }
  return value;
}

async function usable(response: Response): Promise<boolean> {
  if (!response.ok) return false;
  try {
    const data = await response.clone().json() as { choices?: Array<{ message?: { content?: unknown; tool_calls?: unknown[] } }> };
    const message = data.choices?.[0]?.message;
    return Boolean(
      (typeof message?.content === 'string' && message.content.trim()) ||
      (Array.isArray(message?.tool_calls) && message.tool_calls.length)
    );
  } catch {
    return true;
  }
}

export function createJevRouterFetch(fetchImpl: typeof fetch = fetch): typeof fetch {
  return (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.endsWith('/chat/completions') || typeof init?.body !== 'string') return fetchImpl(input, init);

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(init.body) as Record<string, unknown>;
    } catch {
      return fetchImpl(input, init);
    }
    const percent = canaryPercent();
    if (percent === 0 || Math.random() * 100 >= percent) {
      return fetchImpl(input, init);
    }

    const plugins = Array.isArray(body.plugins)
      ? body.plugins.filter((plugin) => !plugin || typeof plugin !== 'object' || (plugin as { id?: unknown }).id !== 'jev-router')
      : [];
    let routed: Response;
    try {
      routed = await fetchImpl(input, {
        ...init,
        body: JSON.stringify({
          ...body,
          model: JEV_ROUTER_MODEL,
          plugins: [{ id: 'jev-router', cost_tier: costTier() }, ...plugins],
        }),
      });
    } catch {
      return fetchImpl(input, init);
    }
    if (await usable(routed)) return routed;
    await routed.body?.cancel().catch(() => undefined);
    return fetchImpl(input, init);
  }) as typeof fetch;
}
