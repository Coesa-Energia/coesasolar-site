-- Auditoria SEO 02/10/2026: 4 pares de artigos com a mesma keyword (versão de agosto,
-- curta, vs. versão mais nova ~3x maior) canibalizando entre si. Mantém a versão nova;
-- a antiga vira 'archived' (sai de /blog, categorias, sitemap e home) e o slug antigo
-- redireciona 301 para o novo (next.config.js, ARCHIVED_ARTICLE_REDIRECTS).
-- Causa raiz da duplicação já corrigida no PR #59 (dedup por keyword publicada).
alter table public.coesa_articles drop constraint coesa_articles_status_check;
alter table public.coesa_articles add constraint coesa_articles_status_check
  check (status = any (array['generating'::text, 'published'::text, 'failed'::text, 'archived'::text]));

update public.coesa_articles set status = 'archived'
where status = 'published' and slug in (
  'energia-solar-por-assinatura-como-funciona',
  'quanto-economiza-energia-solar-assinatura',
  'desconto-conta-de-luz-minas-gerais',
  'economizar-conta-de-luz-sem-instalacao'
);
