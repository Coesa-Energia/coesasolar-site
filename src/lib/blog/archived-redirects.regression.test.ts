// REGRESSÃO 02/10/2026 — auditoria SEO: 4 pares de posts com a mesma keyword
// canibalizando entre si. O slug antigo foi arquivado e precisa redirecionar (308)
// para a versão mantida; nenhum destino pode ser também um slug arquivado (cadeia).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ARCHIVED_ARTICLE_REDIRECTS, LEGACY_WORDPRESS_REDIRECTS, buildArchivedRedirects } = require('./archived-redirects.js') as {
  ARCHIVED_ARTICLE_REDIRECTS: Record<string, string>
  LEGACY_WORDPRESS_REDIRECTS: Record<string, string>
  buildArchivedRedirects: () => unknown[]
}

describe('REGRESSÃO: redirects dos artigos arquivados por duplicidade', () => {
  it('next.config.js publica um redirect permanente para cada slug arquivado', () => {
    const config = readFileSync(join(__dirname, '../../../next.config.js'), 'utf-8').replace(/\/\/[^\n]*/g, '')
    expect(config).toMatch(/async redirects\(\)\s*\{\s*return buildArchivedRedirects\(\)/)
    const redirects = buildArchivedRedirects()
    for (const [from, to] of Object.entries(ARCHIVED_ARTICLE_REDIRECTS)) {
      expect(redirects).toContainEqual({ source: `/blog/${from}`, destination: `/blog/${to}`, permanent: true })
    }
  })

  it('nenhum destino é um slug arquivado (sem cadeia de redirect)', () => {
    const archived = new Set(Object.keys(ARCHIVED_ARTICLE_REDIRECTS))
    for (const to of Object.values(ARCHIVED_ARTICLE_REDIRECTS)) expect(archived.has(to)).toBe(false)
  })

  it('resolve links antigos publicados fora de /blog', () => {
    expect(buildArchivedRedirects()).toEqual(expect.arrayContaining([
      { source: '/desconto-na-conta-de-luz-minas-gerais', destination: '/blog/desconto-na-conta-de-luz-minas-gerais', permanent: true },
      { source: '/como-verificar-conta-de-energia', destination: '/blog/creditos-energia-solar-conta-luz', permanent: true },
      { source: '/distribuidoras', destination: '/blog/o-que-e-geracao-distribuida-de-energia', permanent: true },
    ]))
  })

  it('migra os domínios e os 19 posts antigos do WordPress', () => {
    const redirects = buildArchivedRedirects() as Array<{ source: string; destination: string; permanent: boolean; has?: Array<{ type: string; value: string }> }>
    expect(redirects).toEqual(expect.arrayContaining([
      { source: '/:path*', has: [{ type: 'host', value: 'coesasolar.com.br' }], destination: 'https://coesaenergia.com.br/:path*', permanent: true },
      { source: '/:path*', has: [{ type: 'host', value: 'www.coesaenergia.com.br' }], destination: 'https://coesaenergia.com.br/:path*', permanent: true },
      { source: '/assinatura-energia-solar-guia-pratico-condominios', destination: '/blog/geracao-compartilhada-condominios', permanent: true },
    ]))
    expect(Object.keys(LEGACY_WORDPRESS_REDIRECTS)).toHaveLength(19)
  })

  it('a migration arquiva exatamente os slugs redirecionados', () => {
    const sql = readFileSync(join(__dirname, '../../../supabase/migrations/20261002230000_archive_duplicate_blog_articles.sql'), 'utf-8')
    const slugs = [...sql.matchAll(/^\s*'([a-z0-9-]+)',?$/gm)].map(m => m[1])
    expect(slugs.sort()).toEqual(Object.keys(ARCHIVED_ARTICLE_REDIRECTS).sort())
  })
})
