// REGRESSÃO 02/10/2026 — auditoria SEO: /categoria/faq vazia era indexável (thin content).
import { describe, expect, it, vi } from 'vitest'

const byCategory: Record<string, unknown[]> = { guias: [{ slug: 'a' }], faq: [] }
vi.mock('@/lib/blog/supabase-blog', () => ({ getArticlesByCategory: async (s: string) => byCategory[s] ?? [] }))

import { generateMetadata } from './page'

const meta = (slug: string) => generateMetadata({ params: Promise.resolve({ slug }) })

describe('REGRESSÃO: categoria vazia fora do índice', () => {
  it('categoria vazia → noindex, follow', async () => {
    expect((await meta('faq')).robots).toEqual({ index: false, follow: true })
  })
  it('categoria com artigo continua indexável', async () => {
    expect((await meta('guias')).robots).toBeUndefined()
  })
})
