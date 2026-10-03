import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/blog/supabase-blog';
import { AUTOBLOG_PROFILE } from '@/lib/autoblog-profile';
import { getVagasPublicadas } from '@/lib/carreiras/supabase';

// REGRESSÃO 22/08/2026 — relatório do Sentinel (regras-universais.5, "artigo mais
// recente ausente do sitemap"): sem revalidate, esta rota é gerada 1x no build e fica
// congelada até o próximo deploy — artigos publicados pelo cron do autoblog depois do
// build nunca entram no sitemap.xml servido, mesmo semanas depois. As rotas irmãs
// (/blog, /categoria/[slug]) já usam ISR 1h; esta era a exceção.
export const revalidate = 3600; // ISR 1h — mesmo padrão de /blog e /categoria/[slug]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = AUTOBLOG_PROFILE.brand.siteUrl;
  let articles: Awaited<ReturnType<typeof getAllArticles>> = [];
  try {
    articles = await getAllArticles();
  } catch {
    // Supabase indisponível em build time — sitemap sai só com as páginas fixas
  }
  // lastmod das páginas de listagem = artigo mais recente (elas mudam quando entra post novo).
  const latestArticleAt = articles.reduce<Date | undefined>((latest, a) => {
    const d = new Date(a.published_at);
    return !latest || d > latest ? d : latest;
  }, undefined) ?? new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: latestArticleAt,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/energia-solar-por-assinatura-minas-gerais`,
      lastModified: new Date('2026-10-03'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/carreiras`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/carreiras/banco-de-talentos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/investimentos`,
      lastModified: new Date('2026-09-29'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: latestArticleAt,
      changeFrequency: 'daily',
      priority: 1,
    },
    // Páginas de categoria: arquitetura da informação (RD) — só as que têm artigo
    // (categoria vazia é noindex; ver src/app/categoria/[slug]/page.tsx).
    ...AUTOBLOG_PROFILE.editorial.categories
      .filter(category => articles.some(a => a.category === category.slug))
      .map(category => ({
      url: `${siteUrl}/categoria/${category.slug}`,
      lastModified: latestArticleAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ];

  for (const article of articles) {
    entries.push({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: new Date(article.published_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  try {
    const vagas = await getVagasPublicadas();
    for (const vaga of vagas) {
      entries.push({
        url: `${siteUrl}/carreiras/${vaga.slug}`,
        lastModified: vaga.publicado_em ? new Date(vaga.publicado_em) : new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  } catch {
    // Supabase de RH indisponível — preserva o restante do sitemap.
  }

  return entries;
}
