// REGRESSÃO 02/10/2026 — GA4 da produção recebia sessões de localhost, 127.0.0.1 e
// Previews da Vercel (hostName no relatório), poluindo métricas de tráfego.
import { describe, expect, it } from 'vitest'
import { shouldLoadAnalytics } from './should-track'

describe('REGRESSÃO: GA4 só em produção', () => {
  it.each([
    [{ VERCEL_ENV: 'production' }, true],
    [{ VERCEL_ENV: 'preview' }, false],
    [{ VERCEL_ENV: 'development' }, false],
    [{}, false],
  ])('%o → %s', (env, expected) => {
    expect(shouldLoadAnalytics(env as NodeJS.ProcessEnv)).toBe(expected)
  })
})
