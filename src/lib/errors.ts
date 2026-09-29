export function getErrorMessage(error: unknown, fallback = 'Erro desconhecido'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = Reflect.get(error, 'message');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

export function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const code = Reflect.get(error, 'error_code');
  return typeof code === 'string' ? code : undefined;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
