// Seção de blog da home. A rota / (server) passa os 3 artigos mais recentes em
// initialArticles — assim os links para os posts saem no HTML inicial (descoberta
// pelo Google). Sem initialArticles (home aberta por navegação dentro do SPA), lê
// direto do PostgREST com a chave anon (RLS expõe só published) — envs NEXT_PUBLIC_BLOG_*.
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizePublicDiscountClaim } from "@/lib/public-discount";

export interface BlogArticle {
  slug: string;
  title: string;
  meta_desc: string | null;
  keyword: string | null;
  published_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    // Fixo: o servidor (UTC) e o navegador precisam formatar igual (hidratação).
    timeZone: "America/Sao_Paulo",
  });
}

function normalizeArticle(article: BlogArticle): BlogArticle {
  return {
    ...article,
    title: normalizePublicDiscountClaim(article.title),
    meta_desc: article.meta_desc ? normalizePublicDiscountClaim(article.meta_desc) : null,
    keyword: article.keyword ? normalizePublicDiscountClaim(article.keyword) : null,
  };
}

export function HomeBlogSection({ initialArticles }: { initialArticles?: BlogArticle[] } = {}) {
  const hasInitial = !!initialArticles?.length;
  const [articles, setArticles] = useState<BlogArticle[]>(hasInitial ? initialArticles!.map(normalizeArticle) : []);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return;
    const url = process.env.NEXT_PUBLIC_BLOG_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_BLOG_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      setLoading(false);
      return;
    }
    fetch(
      `${url}/rest/v1/coesa_articles?select=slug,title,meta_desc,keyword,published_at&status=eq.published&order=published_at.desc&limit=3`,
      { headers: { apikey: anon, Authorization: `Bearer ${anon}` } }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data.map(normalizeArticle) : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [hasInitial]);

  if (!loading && articles.length === 0) return null;

  return (
    <section id="blog" aria-labelledby="blog-titulo" className="scroll-mt-20 bg-[#f4efe3] text-[#17251b]">
      <div className="mx-auto flex max-w-[1600px] flex-col justify-center px-5 py-14 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:px-14 lg:py-8 xl:px-20">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-9 grid items-end gap-6 border-b border-[#c4ccbf] pb-6 lg:grid-cols-[1fr_0.55fr]"
        >
          <div><p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#617b64]">15 · Conteúdo</p><h2 id="blog-titulo" className="text-[clamp(3rem,5.2vw,6rem)] font-medium leading-[0.96] tracking-[-0.07em]">Energia sem <span className="text-[#467653]">dúvidas.</span></h2></div>
          <p className="max-w-md text-base leading-relaxed text-[#5c695d] lg:pb-2">Guias e explicações para entender sua conta, o modelo de assinatura e a energia solar.</p>
        </motion.div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3 rounded-[1.2rem] border border-[#c4ccbf] bg-white p-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <a
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex min-h-[280px] flex-col rounded-[1.2rem] border border-[#c4ccbf] bg-white p-6 transition-colors hover:border-[#467653] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#467653]"
              >
                {article.keyword && (
                  <p className="mb-5 line-clamp-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#467653]">
                    {article.keyword}
                  </p>
                )}
                <h3
                  className="mb-3 line-clamp-3 text-2xl font-medium leading-tight tracking-[-0.04em] transition-colors group-hover:text-[#467653]"
                >
                  {article.title}
                </h3>
                {article.meta_desc && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-[#667369]">
                    {article.meta_desc}
                  </p>
                )}
                <p className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-[#667369]">
                  {formatDate(article.published_at)}
                </p>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 text-right">
          <a
            href="/blog"
            className="inline-flex min-h-11 items-center rounded-full border border-[#b9c8b9] px-5 text-sm font-medium text-[#244433] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#467653]"
          >
            Ver todos os artigos →
          </a>
        </div>
      </div>
    </section>
  );
}
