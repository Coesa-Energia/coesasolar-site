// Artigos arquivados por duplicidade de keyword (auditoria SEO 02/10/2026; migration
// 20261002230000_archive_duplicate_blog_articles.sql): slug antigo → versão mantida.
// CommonJS porque é lido pelo next.config.js (redirects 308).
const ARCHIVED_ARTICLE_REDIRECTS = {
  'energia-solar-por-assinatura-como-funciona': 'energia-solar-por-assinatura-como-funciona-2',
  'quanto-economiza-energia-solar-assinatura': 'quanto-economiza-energia-solar-assinatura-2',
  'desconto-conta-de-luz-minas-gerais': 'desconto-na-conta-de-luz-minas-gerais',
  'economizar-conta-de-luz-sem-instalacao': 'economizar-conta-de-luz-sem-instalacao-2',
}

function buildArchivedRedirects() {
  return Object.entries(ARCHIVED_ARTICLE_REDIRECTS).map(([from, to]) => ({
    source: `/blog/${from}`,
    destination: `/blog/${to}`,
    permanent: true,
  }))
}

module.exports = { ARCHIVED_ARTICLE_REDIRECTS, buildArchivedRedirects }
