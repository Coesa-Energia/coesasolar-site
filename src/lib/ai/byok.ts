import OpenAI from 'openai';

export type ByokCapability = 'fast' | 'quality' | 'critical';

export const BYOK_MODELS: Record<ByokCapability, readonly [string, string]> = {
  fast: ['openai/gpt-5-nano', 'anthropic/claude-haiku-5.5'],
  quality: ['openai/gpt-6.1-sol', 'anthropic/claude-sonnet-5.5'],
  critical: ['openai/gpt-6-astra', 'anthropic/claude-opus-5.5'],
};

export const BYOK_PROVIDER = {
  only: ['openai', 'anthropic'],
  allow_fallbacks: false,
  require_parameters: true,
} as const;

export function buildByokChatBody(
  body: Record<string, unknown>,
  capability: ByokCapability,
): Record<string, unknown> {
  const routed = { ...body };
  delete routed.model;
  delete routed.provider;
  delete routed.temperature;
  delete routed.reasoning_effort;
  return {
    ...routed,
    models: [...BYOK_MODELS[capability]],
    provider: BYOK_PROVIDER,
    usage: { include: true },
  };
}

type ByokErrorCode = 'BYOK_POLICY_VIOLATION' | 'BYOK_UNVERIFIED' | 'BYOK_MODEL_MISMATCH';

function policyError(code: ByokErrorCode): Response {
  return new Response(JSON.stringify({ error: { message: code, type: 'byok_policy_error', code } }), {
    status: 502,
    headers: { 'content-type': 'application/json' },
  });
}

export async function validateByokResponse(
  response: Response,
  allowedModels?: readonly string[],
): Promise<Response> {
  if (!response.ok) return response;
  const payload = await response.clone().json().catch(() => null) as {
    model?: string;
    usage?: { is_byok?: boolean };
  } | null;
  if (payload?.usage?.is_byok !== true) {
    return policyError(payload?.usage?.is_byok === false ? 'BYOK_POLICY_VIOLATION' : 'BYOK_UNVERIFIED');
  }
  if (allowedModels && (!payload.model || !allowedModels.includes(payload.model))) {
    return policyError('BYOK_MODEL_MISMATCH');
  }
  return response;
}

export function createByokFetch(
  capability: ByokCapability,
  transport: typeof fetch = globalThis.fetch,
): typeof fetch {
  return async (input, init) => {
    const rawBody = init?.body ?? (input instanceof Request ? await input.clone().text() : undefined);
    if (typeof rawBody !== 'string') return policyError('BYOK_UNVERIFIED');

    let body: Record<string, unknown>;
    try {
      const parsed = JSON.parse(rawBody) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid body');
      body = parsed as Record<string, unknown>;
    } catch {
      return policyError('BYOK_UNVERIFIED');
    }

    const response = await transport(input, { ...init, body: JSON.stringify(buildByokChatBody(body, capability)) });
    return validateByokResponse(response, BYOK_MODELS[capability]);
  };
}

export function createByokClient(
  capability: ByokCapability,
  options: NonNullable<ConstructorParameters<typeof OpenAI>[0]>,
): OpenAI {
  const { fetch: transport = globalThis.fetch, ...rest } = options;
  return new OpenAI({
    ...rest,
    baseURL: 'https://openrouter.ai/api/v1',
    maxRetries: 0,
    fetch: createByokFetch(capability, transport),
  });
}
