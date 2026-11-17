import type { Metadata } from "next"
import { Figtree, Poppins } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { Check, Plus } from "lucide-react"
import coesaLogo from "@/assets/logos/coesa-black.png"
import { COESA_COMPANY } from "@/lib/coesa-company"
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount"
import { FormularioIndicacao } from "./FormularioIndicacao"

// Página do link pessoal de indicação (coesasolar.com.br/i/arthur_azevedo27). Cada cliente da Coesa tem o seu link
// (gerado no AIOS, lib/indicacoes/codigos.ts). A página pergunta ao AIOS o nome de quem indicou e embute o formulário
// "indicacao-amigo" com o código: o lead chega ao Bitrix "Indicado por ..." e a indicação conta para quem indicou.
// Código que não existe (ou AIOS fora do ar): a página funciona igual, com o texto genérico.
// Visual próprio desta página (17/11/2026): minimalista, fundo creme, verde profundo, Poppins nos títulos e Figtree no texto.
const AIOS_URL = (process.env.AIOS_URL || "https://aios.dev.br").replace(/\/+$/, "")
const FORMULARIO = process.env.AIOS_FORMULARIO_INDICACAO || "indicacao-amigo"

const titulo = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--fonte-titulo" })
const texto = Figtree({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fonte-texto" })

type Props = { params: Promise<{ codigo: string }> }

// Página pessoal: fora do Google (cada link é de um cliente).
export const metadata: Metadata = {
  title: "Você foi indicado para economizar na conta de luz | Coesa Solar",
  description: `Um cliente da Coesa indicou você. Economize ${PUBLIC_DISCOUNT_LABEL} na conta de luz com energia solar, sem obras e sem investimento.`,
  robots: { index: false, follow: false },
}

/** Nome de quem indicou ("Arthur Azevedo"), ou null quando o código não existe ou o AIOS não respondeu. */
async function nomeDeQuemIndicou(codigo: string): Promise<string | null> {
  try {
    const r = await fetch(`${AIOS_URL}/api/indicacao-publica/${encodeURIComponent(codigo)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    })
    if (!r.ok) return null
    const json = (await r.json()) as { nome?: unknown }
    return typeof json.nome === "string" && json.nome.trim() ? json.nome.trim() : null
  } catch {
    return null
  }
}

const iniciais = (nome: string) =>
  nome
    .split(" ")
    .slice(0, 2)
    .map(p => p.charAt(0))
    .join("")
    .toUpperCase()

const vantagens = ["Sem placas no telhado", "Sem obra e sem investimento", "Sem taxa de adesão", "A mesma distribuidora de sempre"]

const perguntas = [
  {
    p: "Preciso instalar alguma coisa?",
    r: "Não. A energia vem de usinas solares da Coesa e entra como crédito na sua conta de luz. Nada muda no seu imóvel.",
  },
  {
    p: "Quanto custa para começar?",
    r: "Nada. Não tem taxa de adesão nem investimento. Você só passa a pagar menos pela energia.",
  },
  {
    p: "O que quem me indicou ganha?",
    r: "Se você virar cliente, quem indicou chega mais perto de um desconto na conta de luz. Para você nada muda: o seu desconto é o mesmo.",
  },
  {
    p: "O que acontece com os meus dados?",
    r: "Usamos o seu nome e o seu WhatsApp só para fazer a simulação e falar com você. Quem indicou não vê os seus dados.",
  },
]

export default async function PaginaIndicacao({ params }: Props) {
  const { codigo } = await params
  const nome = await nomeDeQuemIndicou(codigo)
  const primeiroNome = nome?.split(" ")[0]

  return (
    <div className={`${titulo.variable} ${texto.variable} min-h-screen bg-[#FAF8F3] font-[family-name:var(--fonte-texto)] text-[#0F1F17] antialiased`}>
      <header>
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5 md:px-8">
          <Link href="/" aria-label="Coesa Energia, início">
            <Image src={coesaLogo} alt="Coesa Energia" width={192} height={108} className="h-10 w-auto" priority />
          </Link>
        </div>
      </header>

      <main>
        {/* Topo: o formulário é a primeira coisa que o amigo vê. */}
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-14 pt-4 md:px-8 md:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-4 ring-1 ring-[#0F1F17]/[0.06]">
              <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#1A422F] text-xs font-semibold text-[#F3EBD6]">
                {nome ? iniciais(nome) : <Check className="h-4 w-4" />}
              </span>
              <span className="text-sm text-[#0F1F17]/75">
                Você foi indicado por <strong className="font-semibold text-[#0F1F17]">{nome ?? "um cliente da Coesa"}</strong>
              </span>
            </div>

            <h1 className="text-balance font-[family-name:var(--fonte-titulo)] text-[2.1rem] font-bold leading-[1.06] tracking-[-0.04em] md:text-[3.25rem]">
              Sua conta de luz até {PUBLIC_DISCOUNT_LABEL} mais leve.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#0F1F17]/70 md:text-lg">
              {primeiroNome ? `${primeiroNome} já economiza com a Coesa e lembrou de você.` : "Um cliente da Coesa lembrou de você."} Sem placas, sem
              obra e sem investimento. Preencha o formulário e veja quanto você economiza.
            </p>
          </div>

          {/* Foto alta à direita, com o formulário em vidro (fundo fosco) por cima dela. O formulário do AIOS tem fundo transparente. */}
          <div id="simulacao" className="relative flex scroll-mt-4 items-center justify-center overflow-hidden rounded-[2rem] p-3 sm:p-7 lg:min-h-[40rem]">
            <Image
              src="/coesa-hero/indicacao-foto.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 31rem, 100vw"
              className="object-cover object-center" unoptimized
              priority
            />
            <div className="relative w-full max-w-[28rem] overflow-hidden rounded-3xl border border-white/70 bg-white/55 shadow-[0_24px_60px_-24px_rgba(15,31,23,0.45),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-150">
              <FormularioIndicacao origem={AIOS_URL} slug={FORMULARIO} codigo={codigo} nomeDeQuemIndicou={nome} whatsapp={COESA_COMPANY.whatsapp} />
            </div>
          </div>
        </section>

        {/* Frase em dois tons e o que não muda para o amigo. */}
        <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
          <h2 className="max-w-3xl font-[family-name:var(--fonte-titulo)] text-3xl font-bold leading-[1.1] tracking-[-0.04em] md:text-4xl">
            <span className="text-[#0F1F17]/35">A distribuidora entrega a energia.</span>
            <br />
            <span className="text-[#1A422F]">A Coesa deixa ela mais barata.</span>
          </h2>
          <ul className="mt-7 flex flex-wrap gap-3">
            {vantagens.map(v => (
              <li key={v} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-[#0F1F17]/[0.07]">
                <Check aria-hidden className="h-4 w-4 text-[#1A422F]" />
                {v}
              </li>
            ))}
          </ul>
        </section>

        {/* Dúvidas. */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-6 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <h2 className="font-[family-name:var(--fonte-titulo)] text-3xl font-bold tracking-[-0.04em]">Dúvidas</h2>
            <div className="divide-y divide-[#0F1F17]/10 border-y border-[#0F1F17]/10">
              {perguntas.map(q => (
                <details key={q.p} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold [&::-webkit-details-marker]:hidden">
                    {q.p}
                    <Plus aria-hidden className="h-5 w-5 flex-shrink-0 text-[#1A422F] transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-xl leading-relaxed text-[#0F1F17]/70">{q.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
