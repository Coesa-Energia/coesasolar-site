const rpcMock = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc: rpcMock }),
}))

import { insertArticle } from './supabase-blog'

describe('REGRESSÃO: publicação não para após três colisões de slug', () => {
  it('repete o RPC com sufixo único quando slug, -2 e -3 já existem', async () => {
    vi.stubEnv('BLOG_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('BLOG_SUPABASE_SERVICE_ROLE_KEY', 'service-role')
    vi.stubEnv('CRON_SECRET', 'cron-secret')
    rpcMock
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: 'energia-solar-oficina-ab12', error: null })

    await expect(insertArticle({
      slug: 'energia-solar-oficina',
      title: 'Energia solar para oficina',
      page_title: null,
      meta_desc: 'Descrição',
      content: 'Conteúdo',
      cover_url: null,
      cover_alt: null,
      keyword: 'energia solar para oficina',
      category: 'comercial',
    })).resolves.toBe('energia-solar-oficina-ab12')

    expect(rpcMock).toHaveBeenCalledTimes(2)
    expect(rpcMock.mock.calls[1][1].p_slug).toMatch(/^energia-solar-oficina-[a-f0-9]{8}$/)
  })
})
