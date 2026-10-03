import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AUTOBLOG_PROFILE } from "@/lib/autoblog-profile"
import { buildHomeJsonLd } from "@/lib/seo/home-jsonld"
import { isSpaRoute } from "@/lib/seo/spa-routes"
import HomeClient from "./HomeClient"
import SpaClient from "./SpaClient"

// ISR: a home é igual para todos os visitantes; sem isso a rota era dinâmica
// (Cache-Control no-store, CDN sempre MISS). generateStaticParams vazio liga o cache
// para os caminhos renderizados on-demand.
export const revalidate = 3600
export async function generateStaticParams() {
  return []
}

type PageProps = { params: Promise<{ slug?: string[] }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!slug?.length) return { alternates: { canonical: `${AUTOBLOG_PROFILE.brand.siteUrl}/` } }
  // Telas internas/transacionais do SPA (CRM, propostas, login) não devem ser indexadas.
  return { robots: { index: false, follow: false } }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params

  if (!slug?.length) {
    return (
      <>
        <HomeClient />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHomeJsonLd()).replace(/</g, "\\u003c") }}
        />
      </>
    )
  }

  if (!isSpaRoute(slug)) notFound()
  return <SpaClient />
}
