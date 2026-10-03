import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Página não encontrada | Coesa Solar",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F0E7] px-6 text-[#17211D]">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#526159]">Erro 404</p>
        <h1 className="mb-4 font-serif text-4xl leading-tight text-[#064A36]">Esta página não existe</h1>
        <p className="mb-8 text-[#526159]">O endereço pode ter mudado ou sido digitado errado.</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/" className="rounded-md bg-[#064A36] px-5 py-3 font-medium text-white hover:bg-[#064A36]/90">
            Ir para a página inicial
          </a>
          <a href="/blog" className="rounded-md border border-[#B8B5AA] px-5 py-3 font-medium text-[#064A36] hover:bg-white">
            Ler o blog
          </a>
        </div>
      </div>
    </main>
  )
}
