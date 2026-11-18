"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle } from "lucide-react"

// Formulário do AIOS (form "indicacao-amigo") embutido na página do link pessoal. O código de quem indicou vai no
// endereço do formulário (?indicacao=...): é assim que o AIOS liga o lead a quem indicou (lib/indicacoes/formulario.ts
// no AIOS). Os parâmetros de campanha da página (utm_*) seguem junto. A altura acompanha o formulário (mensagem gf-resize).
//
// Depois do envio o formulário avisa a página (mensagem gf-lead, sem dado pessoal). O lead já foi criado no Bitrix e a
// equipe já foi acionada pelo rodízio: a tela de agradecimento só convida o amigo a chamar a Coesa no WhatsApp, com a
// mensagem pronta. Quem não clicar não perde nada: a equipe entra em contato do mesmo jeito (o contato é um só, o
// mesmo número do amigo cai na mesma conversa).
const PARAMETROS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]

export function FormularioIndicacao({
  origem,
  slug,
  codigo,
  nomeDeQuemIndicou,
  whatsapp,
}: {
  origem: string
  slug: string
  codigo: string
  nomeDeQuemIndicou: string | null
  whatsapp: string
}) {
  const ref = useRef<HTMLIFrameElement>(null)
  // O endereço só entra depois que a página monta: assim o ouvinte já existe quando o formulário avisa a primeira
  // vez (vindo pronto do servidor, o iframe carregava antes e a primeira altura se perdia).
  const [src, setSrc] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== origem || !e.data) return
      if (e.data.type === "gf-resize" && ref.current && typeof e.data.height === "number" && e.data.height > 0) {
        ref.current.style.height = `${e.data.height}px`
      }
      if (e.data.type === "gf-lead") setEnviado(true)
    }
    window.addEventListener("message", aoReceber)

    const destino = new URL(`${origem}/f/${slug}`)
    destino.searchParams.set("indicacao", codigo)
    const daPagina = new URLSearchParams(window.location.search)
    for (const k of PARAMETROS) {
      const v = daPagina.get(k)
      if (v) destino.searchParams.set(k, v)
    }
    setSrc(destino.toString())

    return () => window.removeEventListener("message", aoReceber)
  }, [origem, slug, codigo])

  const mensagem = `Olá! Fui indicado${nomeDeQuemIndicou ? ` por ${nomeDeQuemIndicou}` : " por um cliente da Coesa"} e quero finalizar meu cadastro.`
  const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`

  return (
    <>
      <iframe
        ref={ref}
        src={src ?? undefined}
        title="Simule sua economia"
        width="100%"
        height={560}
        className={enviado ? "hidden" : "block w-full border-0"}
        sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      {enviado && (
        <div role="status" className="flex min-h-[26rem] flex-col items-center justify-center px-6 py-10 text-center">
          <span aria-hidden className="grid h-14 w-14 place-items-center rounded-full bg-[#1A422F]/10 text-[#1A422F]">
            <MessageCircle className="h-7 w-7" />
          </span>
          <h3 className="mt-5 font-[family-name:var(--fonte-titulo)] text-2xl font-bold tracking-[-0.03em] text-[#0F1F17]">Falta só um passo</h3>
          <p className="mt-3 max-w-xs leading-relaxed text-[#0F1F17]/70">
            Recebemos o seu cadastro. Para finalizar, chame a Coesa no WhatsApp: é por lá que um especialista conclui tudo com você.
          </p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#1A422F] px-6 py-4 font-semibold text-[#F3EBD6] transition-colors hover:bg-[#123224]"
          >
            <MessageCircle aria-hidden className="h-5 w-5" />
            Finalizar no WhatsApp
          </a>
          <p className="mt-4 max-w-xs text-sm leading-snug text-[#0F1F17]/55">Se preferir, não precisa fazer nada: a nossa equipe entra em contato em breve.</p>
        </div>
      )}
    </>
  )
}
