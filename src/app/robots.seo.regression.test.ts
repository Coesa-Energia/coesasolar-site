// REGRESSÃO 03/10/2026 — auditoria GEO: Claude-SearchBot e Perplexity-User caíam só
// no wildcard; IndexNow (Bing/Copilot) sem arquivo de chave publicado.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import robots from './robots'

describe('REGRESSÃO: robots e IndexNow', () => {
  it('libera Claude-SearchBot e Perplexity-User explicitamente', () => {
    const agents = robots().rules as Array<{ userAgent: string | string[] }>
    const all = agents.flatMap(r => (Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]))
    expect(all).toEqual(expect.arrayContaining(['Claude-SearchBot', 'Perplexity-User']))
  })

  it('public/ tem o arquivo de chave do IndexNow (<chave>.txt contendo a própria chave)', () => {
    const pub = join(__dirname, '..', '..', 'public')
    const keyFiles = readdirSync(pub).filter(f => /^[0-9a-f]{32}\.txt$/.test(f))
    expect(keyFiles).toHaveLength(1)
    expect(readFileSync(join(pub, keyFiles[0]), 'utf-8').trim()).toBe(keyFiles[0].replace('.txt', ''))
  })
})
