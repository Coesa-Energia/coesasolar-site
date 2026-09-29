import Link from "next/link"

function dataFeedback(dias: number): string {
  const data = new Date(); data.setDate(data.getDate() + dias); return data.toLocaleDateString("pt-BR")
}

export function CandidaturaSucesso({ feedbackDias }: { feedbackDias?: number }) {
  return (
    <section role="status" aria-live="polite" tabIndex={-1} autoFocus className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coesa-green-dark to-coesa-green px-6 py-10 text-center text-white shadow-coesa-lg outline-none motion-safe:animate-fade-in md:px-10">
      <div aria-hidden="true" className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
      <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-coesa-green-dark shadow-lg motion-safe:animate-pulse-green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
      </div>
      <h2 className="relative font-heading text-2xl font-bold md:text-3xl">Candidatura enviada!</h2>
      <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">{feedbackDias ? `Você receberá nosso feedback até ${dataFeedback(feedbackDias)} — enviaremos o resultado, seja ele qual for.` : "Seu currículo entrou no nosso banco de talentos."}</p>
      <Link href="/carreiras" className="relative mt-6 inline-flex rounded-md border border-white/60 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white hover:text-coesa-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Ver outras oportunidades</Link>
    </section>
  )
}
