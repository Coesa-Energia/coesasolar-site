import { ArrowDownRight } from "lucide-react";
import { SimulationForm } from "./SimulationForm";

export function SimulationSection() {
  return (
    <section id="simulacao" aria-labelledby="simulacao-titulo" className="scroll-mt-20 bg-[#edece2] text-[#17251b]">
      <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-5 py-14 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-14 lg:py-8 xl:px-20">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#56715a]">12 · Comece por aqui</p>
          <h2 id="simulacao-titulo" className="mt-5 text-[clamp(3.2rem,5.6vw,6.4rem)] font-medium leading-[0.94] tracking-[-0.075em]">
            Sua economia<br /><span className="text-[#4b7652]">começa aqui.</span>
          </h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-[#5d695f] sm:text-lg">
            Informe seus dados e o valor médio da conta de luz. A COESA recebe sua solicitação e entra em contato para continuar a simulação.
          </p>
          <div className="mt-10 flex max-w-md items-start gap-5 border-t border-[#cbd2c8] pt-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#b8c7b5] text-[#4b7652]"><ArrowDownRight className="h-5 w-5" strokeWidth={1.5} /></span>
            <p className="text-sm leading-relaxed text-[#677269]">Para começar, tenha em mãos o valor médio mensal da sua conta. Atendemos contas a partir de <strong className="font-medium text-[#253c2a]">R$ 300</strong>.</p>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-[#243b2b] shadow-[0_24px_65px_rgba(18,37,30,0.18)]">
          <SimulationForm compact />
        </div>
      </div>
    </section>
  );
}
