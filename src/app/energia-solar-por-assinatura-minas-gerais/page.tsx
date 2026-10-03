import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"
import coesaLogo from "@/assets/logos/coesa-black.png"
import { HomeFooter } from "@/components/home/HomeFooter"
import { COESA_COMPANY } from "@/lib/coesa-company"
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount"
import { ORGANIZATION_ID } from "@/lib/seo/home-jsonld"

// Página de serviço regional (auditoria SEO 02/10/2026: nenhuma página por área
// atendida). Uma página forte por área real — CEMIG e Energisa MG, as concessionárias
// de CONCESSIONARIAS_ATENDIDAS (SimulationForm) — em vez de páginas finas por cidade.
const SITE_URL = "https://coesasolar.com.br"
const PATH = "/energia-solar-por-assinatura-minas-gerais"
const TITLE = "Energia solar por assinatura em Minas Gerais"

export const metadata: Metadata = {
  title: `${TITLE} | Coesa Solar`,
  description: `Desconto de ${PUBLIC_DISCOUNT_LABEL} na conta de luz para clientes CEMIG e Energisa MG, sem investimento, sem obras e com contratação 100% digital.`,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}${PATH}`,
    title: TITLE,
    description: `Desconto de ${PUBLIC_DISCOUNT_LABEL} na conta de luz em Minas Gerais, sem investimento e sem obras.`,
    images: [`${SITE_URL}/og-image.png`],
  },
}

const distribuidoras = [
  {
    nome: "CEMIG",
    texto: "Atende a maior parte dos municípios mineiros, incluindo Belo Horizonte e a região metropolitana. Os créditos da usina entram na sua fatura CEMIG todo mês.",
  },
  {
    nome: "Energisa MG",
    texto: "Atende municípios da Zona da Mata e de outras regiões de Minas. O desconto funciona do mesmo jeito: a fatura da Energisa passa a vir com os créditos compensados.",
  },
]

const passos = [
  { titulo: "Simule", texto: "Informe o valor da sua conta de luz e veja a economia estimada." },
  { titulo: "Assine", texto: "Contrato 100% digital, sem visita técnica e sem obra." },
  { titulo: "Conecte", texto: "A COESA cuida do cadastro junto à distribuidora." },
  { titulo: "Economize", texto: `A conta passa a vir com ${PUBLIC_DISCOUNT_LABEL} de desconto sobre a energia compensada.` },
]

const leituras = [
  { href: "/blog/desconto-na-conta-de-luz-minas-gerais", label: "Desconto na conta de luz em Minas Gerais" },
  { href: "/blog/compensacao-creditos-energia-como-funciona", label: "Como funciona a compensação de créditos de energia" },
  { href: "/blog/quem-pode-contratar-geracao-distribuida-compartilhada", label: "Quem pode contratar geração distribuída compartilhada" },
]

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_URL}${PATH}#servico`,
        name: TITLE,
        serviceType: "Geração distribuída compartilhada",
        provider: { "@id": ORGANIZATION_ID },
        areaServed: { "@type": "State", name: "Minas Gerais", addressCountry: "BR" },
        description: `Desconto de ${PUBLIC_DISCOUNT_LABEL} na conta de luz para clientes CEMIG e Energisa MG, com energia de usinas solares, sem investimento e sem obras.`,
        url: `${SITE_URL}${PATH}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: TITLE, item: `${SITE_URL}${PATH}` },
        ],
      },
    ],
  }
}

export default function MinasGeraisPage() {
  const whatsapp = `https://wa.me/${COESA_COMPANY.whatsapp}?text=${encodeURIComponent("Olá! Moro em Minas Gerais e quero o desconto na conta de luz.")}`

  return (
    <div className="min-h-screen bg-[#F3F0E7] text-[#17211D]">
      <header className="border-b border-[#B8B5AA]/60">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Coesa Energia — início">
            <Image src={coesaLogo} alt="Coesa Energia" width={192} height={108} className="h-12 w-auto" priority />
          </Link>
          <nav aria-label="Navegação" className="flex items-center gap-5 text-sm text-[#526159]">
            <Link href="/blog" className="hover:text-[#064A36]">Blog</Link>
            <Link href="/" className="hover:text-[#064A36]">Início</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 md:px-8 md:pt-20">
          <nav aria-label="Trilha" className="mb-8 flex items-center gap-1 text-xs text-[#526159]">
            <Link href="/" className="hover:text-[#064A36]">Início</Link>
            <ChevronRight aria-hidden className="h-3 w-3" />
            <span>Minas Gerais</span>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#526159]">CEMIG · Energisa MG</p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight text-[#064A36] md:text-6xl">{TITLE}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#526159]">
            Quem é cliente CEMIG ou Energisa em Minas Gerais pode reduzir a conta de luz em {PUBLIC_DISCOUNT_LABEL} com
            energia de usinas solares da COESA. Não precisa instalar placas, fazer obra nem investir: os créditos da usina
            são compensados direto na sua fatura.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#beneficios" className="rounded-md bg-[#064A36] px-6 py-3 text-center font-medium text-white hover:bg-[#064A36]/90">
              Simular minha economia
            </Link>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#B8B5AA] px-6 py-3 text-center font-medium text-[#064A36] hover:bg-white">
              Falar no WhatsApp
            </a>
          </div>
        </section>

        <section className="border-y border-[#B8B5AA]/60 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:px-8">
            {distribuidoras.map(d => (
              <article key={d.nome}>
                <h2 className="mb-3 font-serif text-2xl text-[#064A36]">{`Clientes ${d.nome}`}</h2>
                <p className="leading-relaxed text-[#526159]">{d.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <h2 className="mb-8 font-serif text-3xl text-[#064A36]">Como funciona o desconto</h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {passos.map((p, i) => (
              <li key={p.titulo} className="border-t border-[#B8B5AA] pt-4">
                <span className="text-xs font-semibold text-[#9BC53D]">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{p.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#526159]">{p.texto}</p>
              </li>
            ))}
          </ol>
          <ul className="mt-12 grid gap-3 text-[#17211D] md:grid-cols-2">
            {[
              `${PUBLIC_DISCOUNT_LABEL} de desconto sobre a energia compensada`,
              "Sem investimento inicial e sem obras no imóvel",
              "Contratação 100% digital",
              "Modelo de geração distribuída previsto na Lei 14.300/2022",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <Check aria-hidden className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#064A36]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
          <h2 className="mb-4 font-serif text-2xl text-[#064A36]">Para saber mais</h2>
          <ul className="space-y-2">
            {leituras.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-[#064A36] underline underline-offset-4 hover:opacity-70">{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <HomeFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }} />
    </div>
  )
}
