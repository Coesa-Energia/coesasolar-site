// REGRESSÃO 02/10/2026 — auditoria SEO: (1) a home não estava no sitemap.xml;
// (2) /categoria/faq vazia ("Nenhum artigo nesta categoria ainda") era indexável e
// estava no sitemap; (3) lastmod das listagens era o instante da regeneração.
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/blog/supabase-blog', () => ({
  getAllArticles: async () => [
    { slug: 'a', category: 'guias', published_at: '2026-09-30T12:00:00Z' },
    { slug: 'b', category: 'economia', published_at: '2026-10-01T12:00:00Z' },
  ],
}))
vi.mock('@/lib/carreiras/supabase', () => ({ getVagasPublicadas: async () => [] }))

import sitemap from './sitemap'

describe('REGRESSÃO: sitemap.xml da auditoria SEO', () => {
  it('inclui a home com lastmod do artigo mais recente', async () => {
    const home = (await sitemap()).find(e => e.url === 'https://coesasolar.com.br/')
    expect(home).toBeDefined()
    expect(new Date(home!.lastModified!).toISOString()).toBe('2026-10-01T12:00:00.000Z')
  })

  it('só lista categorias com artigo', async () => {
    const urls = (await sitemap()).map(e => e.url).filter(u => u.includes('/categoria/'))
    expect(urls.sort()).toEqual(['https://coesasolar.com.br/categoria/economia', 'https://coesasolar.com.br/categoria/guias'])
  })
})
