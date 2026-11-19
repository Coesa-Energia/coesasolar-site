// Artigos arquivados por duplicidade de keyword (auditoria SEO 02/10/2026; migration
// 20261002230000_archive_duplicate_blog_articles.sql): slug antigo → versão mantida.
// CommonJS porque é lido pelo next.config.js (redirects 308).
const ARCHIVED_ARTICLE_REDIRECTS = {
  'energia-solar-por-assinatura-como-funciona': 'energia-solar-por-assinatura-como-funciona-2',
  'quanto-economiza-energia-solar-assinatura': 'quanto-economiza-energia-solar-assinatura-2',
  'desconto-conta-de-luz-minas-gerais': 'desconto-na-conta-de-luz-minas-gerais',
  'economizar-conta-de-luz-sem-instalacao': 'economizar-conta-de-luz-sem-instalacao-2',
}

// Posts do WordPress que ocupava coesaenergia.com.br antes da migração.
const LEGACY_WORDPRESS_REDIRECTS = {
  'vantagens-pouco-conhecidas-energia-solar-compartilhada': 'geracao-distribuida-compartilhada-vale-a-pena',
  'assinatura-energia-solar-guia-pratico-condominios': 'geracao-compartilhada-condominios',
  'consorcio-de-energia-solar-como-funciona': 'o-que-e-geracao-distribuida-de-energia',
  'reduza-custos-pequena-empresa': 'energia-solar-assinatura-pequenas-empresas',
  'energia-solar-vs-energia-tradicional-o-que-muda-na-fatura': 'o-que-muda-conta-luz-energia-solar',
  'monitorar-consumo-energia-tempo-real-2025': 'como-ler-conta-de-luz-cemig',
  'assinatura-energia-solar-7-erros-evitar': 'como-escolher-empresa-energia-solar-assinatura',
  'consorcio-energia-solar-2026-planejamento-ideal': 'geracao-distribuida-compartilhada-vale-a-pena',
  'energia-solar-para-empresas-sem-investimento': 'como-reduzir-custos-com-energia-eletrica-na-empresa',
  'assinatura-de-energia-solar-para-empresas-como-funciona-e-vantagens': 'energia-solar-assinatura-comercio',
  'lucre-mais-com-energia-solar-por-assinatura': 'como-reduzir-custos-com-energia-eletrica-na-empresa',
  'assinatura-de-energia-solar-reduza-sua-conta-sem-instalacao': 'economizar-conta-de-luz-sem-instalacao-2',
  'assinatura-energia-solar-pequenas-empresas-guia-pratico': 'energia-solar-assinatura-pequenas-empresas',
  'como-funciona-cobranca-assinatura-energia-solar': 'compensacao-creditos-energia-como-funciona',
  'economizar-conta-de-luz-energia-solar-assinatura': 'quanto-economiza-energia-solar-assinatura-2',
  'como-economizar-na-conta-de-luz-energia-solar-por-assinatura': 'quanto-economiza-energia-solar-assinatura-2',
  'economia-de-energia-empresa-solar-assinatura': 'como-reduzir-custos-com-energia-eletrica-na-empresa',
  'assinatura-energia-solar-economizar-sem-instalar-paineis': 'economizar-conta-de-luz-sem-instalacao-2',
  'instalar-placa-solar-ou-fazer-assinatura-de-energia-solar': 'energia-solar-sem-investimento-inicial',
}

function buildArchivedRedirects() {
  return [
    ...['coesasolar.com.br', 'www.coesasolar.com.br', 'www.coesaenergia.com.br'].map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: 'https://coesaenergia.com.br/:path*',
      permanent: true,
    })),
    ...Object.entries(ARCHIVED_ARTICLE_REDIRECTS).map(([from, to]) => ({
      source: `/blog/${from}`,
      destination: `/blog/${to}`,
      permanent: true,
    })),
    ...Object.entries(LEGACY_WORDPRESS_REDIRECTS).map(([from, to]) => ({
      source: `/${from}`,
      destination: `/blog/${to}`,
      permanent: true,
    })),
    { source: '/wp-sitemap.xml', destination: '/sitemap.xml', permanent: true },
    { source: '/desconto-na-conta-de-luz-minas-gerais', destination: '/blog/desconto-na-conta-de-luz-minas-gerais', permanent: true },
    { source: '/como-verificar-conta-de-energia', destination: '/blog/creditos-energia-solar-conta-luz', permanent: true },
    { source: '/distribuidoras', destination: '/blog/o-que-e-geracao-distribuida-de-energia', permanent: true },
  ]
}

module.exports = { ARCHIVED_ARTICLE_REDIRECTS, LEGACY_WORDPRESS_REDIRECTS, buildArchivedRedirects }
