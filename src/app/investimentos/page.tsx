import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import coesaLogo from "@/assets/logos/coesa-black.png"

const SITE_URL = "https://coesasolar.com.br"

export const metadata: Metadata = {
  title: "Investimentos | Coesa Energia",
  description:
    "Coesa Energia conclui aporte de R$ 2 milhões na CF Gauss para acelerar a MOVA e novas soluções tecnológicas.",
  alternates: { canonical: `${SITE_URL}/investimentos` },
  openGraph: {
    type: "article",
    url: `${SITE_URL}/investimentos`,
    title: "Coesa conclui aporte de R$ 2 milhões na CF Gauss para acelerar a MOVA",
    description:
      "Rodada pre-seed estruturada via mútuo conversível para mobilidade elétrica, tecnologia e expansão comercial.",
    images: [`${SITE_URL}/og-image.png`],
  },
}

const allocation = [
  {
    value: "R$ 1 milhão",
    eyebrow: "MOVA",
    title: "Mobilidade elétrica",
    description:
      "Expansão da marca de mobilidade elétrica operada pela CF Gauss, com foco em infraestrutura, produto e escala comercial.",
  },
  {
    value: "R$ 1 milhão",
    eyebrow: "CF Gauss",
    title: "Tecnologia e crescimento",
    description:
      "Desenvolvimento tecnológico e expansão comercial das demais operações da empresa.",
  },
]

const strategicPillars = [
  {
    index: "01",
    title: "Eletromobilidade",
    description: "A MOVA transforma energia limpa em uso real, conectando recarga, mobilidade e experiência do cliente.",
  },
  {
    index: "02",
    title: "Infraestrutura",
    description: "Ativos de energia e recarga dão materialidade à tese e criam uma base física para expansão.",
  },
  {
    index: "03",
    title: "Inteligência artificial",
    description: "A CF Gauss adiciona a camada de inteligência para planejamento, automação, monitoramento e escala comercial.",
  },
]

const facts = [
  ["Investidora", "COESA ENERGIA LTDA"],
  ["CNPJ da investidora", "60.937.217/0001-54"],
  ["Empresa investida", "CF GAUSS SERVICOS LTDA"],
  ["CNPJ da investida", "33.672.634/0001-40"],
  ["Instrumento", "Rodada pre-seed via mútuo conversível"],
  ["Status", "Aporte integralmente transferido e recebido"],
] as const

const structuredData = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: "Coesa Energia conclui aporte de R$ 2 milhões na CF Gauss para acelerar a MOVA",
  datePublished: "2026-09-29",
  dateModified: "2026-09-29",
  mainEntityOfPage: `${SITE_URL}/investimentos`,
  author: { "@type": "Organization", name: "Coesa Energia" },
  publisher: {
    "@type": "Organization",
    name: "Coesa Energia",
    url: SITE_URL,
    taxID: "60.937.217/0001-54",
  },
  about: [
    { "@type": "Organization", name: "CF GAUSS SERVICOS LTDA", taxID: "33.672.634/0001-40" },
    { "@type": "Brand", name: "MOVA", url: "https://movaevc.com" },
  ],
}

export default function InvestimentosPage() {
  return (
    <main className="min-h-screen bg-[#f3f0e8] text-[#0b2c22]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="border-b border-[#0b2c22]/15 bg-[#f3f0e8]/95">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Coesa Energia — início">
            <Image src={coesaLogo} alt="Coesa Energia" width={192} height={108} className="h-12 w-auto" priority />
          </Link>
          <nav className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em]">
            <span className="hidden text-[#0b2c22]/45 sm:inline">Relações institucionais</span>
            <span className="h-4 w-px bg-[#0b2c22]/20" />
            <Link href="/" className="transition-opacity hover:opacity-60">Início</Link>
          </nav>
        </div>
      </header>

      <article>
        <section className="relative overflow-hidden border-b border-[#0b2c22]/15">
          <div className="absolute inset-y-0 right-0 hidden w-[38%] border-l border-[#0b2c22]/10 bg-[#d6ff48] lg:block" />
          <div className="absolute right-[8%] top-[-8rem] hidden h-[34rem] w-[34rem] rounded-full border-[7rem] border-[#0b2c22] opacity-[0.06] lg:block" />
          <div className="relative mx-auto grid max-w-7xl lg:grid-cols-[1.6fr_0.9fr]">
            <div className="px-5 py-14 md:px-8 md:py-20 lg:py-28">
              <div className="mb-10 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em]">
                <span className="bg-[#0b2c22] px-3 py-2 text-white">Investimentos</span>
                <span className="text-[#0b2c22]/55">Anúncio institucional · 29 de setembro de 2026</span>
              </div>
              <h1 className="max-w-4xl font-heading text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.8rem]">
                Coesa conclui aporte de <span className="text-[#168755]">R$ 2 milhões</span> na CF Gauss para acelerar a MOVA.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-[#0b2c22]/70 md:text-xl">
                Capital para mobilidade elétrica, desenvolvimento tecnológico e expansão comercial — em uma rodada pre-seed estruturada via mútuo conversível.
              </p>
            </div>

            <aside className="relative flex min-h-[320px] flex-col justify-between bg-[#d6ff48] px-5 py-10 md:px-8 lg:bg-transparent lg:py-20">
              <p className="max-w-xs text-sm font-semibold leading-6 text-[#0b2c22]/70">
                Coesa Energia e CF Gauss, empresas do mesmo grupo econômico, unindo energia, mobilidade e tecnologia para construir operações de maior escala.
              </p>
              <div>
                <p className="font-heading text-[5.5rem] font-semibold leading-none tracking-[-0.08em] md:text-[7rem]">2MM</p>
                <p className="mt-2 border-t border-[#0b2c22]/25 pt-3 text-xs font-bold uppercase tracking-[0.18em]">Capital recebido</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-[#0b2c22]/15 bg-white/55">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <div className="mb-10 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#168755]">Empresas investidas</p>
                <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Duas marcas, uma mesma direção.</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-[#0b2c22]/55">Tecnologia aplicada e mobilidade elétrica, respaldadas pelo investimento da Coesa Energia.</p>
            </div>
            <div className="grid gap-px overflow-hidden border border-[#0b2c22]/15 bg-[#0b2c22]/15 md:grid-cols-2">
              <figure className="flex min-h-56 flex-col justify-between bg-[#f3f0e8] p-8 md:p-10">
                <Image src="/brands/cf-gauss-horizontal.webp" alt="CF Gauss" width={1200} height={494} className="h-auto w-full max-w-[19rem] object-contain object-left" />
                <figcaption className="mt-10 border-t border-[#0b2c22]/15 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#0b2c22]/55">Tecnologia · IA · expansão</figcaption>
              </figure>
              <figure className="flex min-h-56 flex-col justify-between bg-[#f3f0e8] p-8 md:p-10">
                <Image src="/brands/mova-wordmark.webp" alt="MOVA — Movement is Art" width={1400} height={325} className="h-auto w-full max-w-[22rem] object-contain object-left" />
                <figcaption className="mt-10 border-t border-[#0b2c22]/15 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#0b2c22]/55">Eletromobilidade · infraestrutura</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#168755]">A operação</p>
              <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] md:text-4xl">Um investimento, duas frentes de crescimento.</h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-[#0b2c22]/15 bg-[#0b2c22]/15 md:grid-cols-2">
              {allocation.map((item) => (
                <section key={item.eyebrow} className="bg-[#f3f0e8] p-7 md:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#168755]">{item.eyebrow}</p>
                  <p className="mt-8 font-heading text-4xl font-semibold tracking-[-0.04em]">{item.value}</p>
                  <h3 className="mt-8 border-t border-[#0b2c22]/15 pt-6 text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#0b2c22]/65">{item.description}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0b2c22] text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#83d9ad]">Transparência</p>
              <h2 className="mt-4 max-w-md font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] md:text-4xl">Dados objetivos da rodada.</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/55">
                O aporte de R$ 2 milhões foi integralmente transferido pela Coesa Energia e recebido pela CF Gauss, conforme o instrumento contratual.
              </p>
            </div>
            <dl className="border-t border-white/20">
              {facts.map(([label, value]) => (
                <div key={label} className="grid gap-2 border-b border-white/15 py-5 sm:grid-cols-[12rem_1fr] sm:gap-8">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">{label}</dt>
                  <dd className="text-sm font-semibold leading-6 text-white/90">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-[#d6ff48]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b2c22]/55">Setor e fit estratégico</p>
                <h2 className="mt-4 max-w-lg font-heading text-3xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">Energia renovável é a origem da tese.</h2>
                <p className="mt-6 max-w-lg text-base leading-8 text-[#0b2c22]/70">
                  O investimento aproxima oferta de energia limpa, infraestrutura física e inteligência digital. A Coesa traz a base energética; a CF Gauss desenvolve tecnologia; a MOVA leva essa combinação à mobilidade elétrica.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {["Energia renovável", "Eletromobilidade", "Infraestrutura", "Inteligência artificial"].map((sector) => (
                    <span key={sector} className="border border-[#0b2c22]/25 bg-[#f3f0e8]/70 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em]">{sector}</span>
                  ))}
                </div>
              </div>

              <div className="grid gap-px overflow-hidden border border-[#0b2c22]/20 bg-[#0b2c22]/20 sm:grid-cols-2">
                <section className="bg-[#0b2c22] p-7 text-white sm:col-span-2 md:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#83d9ad]">Fundamento</p>
                  <h3 className="mt-8 max-w-xl font-heading text-3xl font-semibold tracking-[-0.035em]">Energia limpa como plataforma para novos negócios.</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">A geração renovável sustenta a expansão da infraestrutura, reduz a intensidade de carbono da mobilidade e cria o elo econômico entre as empresas do grupo.</p>
                </section>
                {strategicPillars.map((pillar, index) => (
                  <section key={pillar.title} className={`bg-[#f3f0e8] p-7 md:p-9 ${index === 2 ? "sm:col-span-2" : ""}`}>
                    <p className="font-heading text-sm font-semibold text-[#168755]">{pillar.index}</p>
                    <h3 className="mt-8 text-lg font-bold">{pillar.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#0b2c22]/65">{pillar.description}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#0b2c22]/15 bg-white/45">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 py-12 md:flex-row md:items-center md:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#168755]">Conheça a operação</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.03em]">MOVA — Movement is Art</h2>
            </div>
            <a href="https://movaevc.com" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-between gap-8 bg-[#0b2c22] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#168755]">
              Acessar movaevc.com
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </section>
      </article>

      <footer className="bg-[#f3f0e8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 text-xs text-[#0b2c22]/55 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <Image src={coesaLogo} alt="Coesa Energia" width={192} height={108} className="mb-4 h-10 w-auto opacity-80" />
            <p>COESA ENERGIA LTDA · CNPJ 60.937.217/0001-54</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-1 font-bold uppercase tracking-[0.12em] text-[#0b2c22]">
            Voltar ao site <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </footer>
    </main>
  )
}
