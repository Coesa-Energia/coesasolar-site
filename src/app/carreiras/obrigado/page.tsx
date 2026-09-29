import type { Metadata } from "next"
import { CareersHeader } from "@/components/carreiras/CareersHeader"
import { CandidaturaSucesso } from "@/components/carreiras/CandidaturaSucesso"
import { HomeFooter } from "@/components/home/HomeFooter"

export const metadata: Metadata = {
  title: "Candidatura enviada | Coesa Energia",
  robots: { index: false, follow: false },
}

interface PageProps { searchParams: Promise<{ vaga?: string; feedback?: string }> }

export default async function ObrigadoPage({ searchParams }: PageProps) {
  const { feedback } = await searchParams
  const dias = Number(feedback)
  const feedbackDias = Number.isInteger(dias) && dias > 0 && dias <= 90 ? dias : undefined

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <CareersHeader />
      <section className="px-5 py-10 md:px-8 md:py-14">
        <div className="container mx-auto max-w-3xl">
          <CandidaturaSucesso feedbackDias={feedbackDias} />
        </div>
      </section>
      <HomeFooter compact />
    </main>
  )
}
