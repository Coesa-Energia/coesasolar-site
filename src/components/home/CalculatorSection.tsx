"use client";

import { EconomyCalculator } from './EconomyCalculator';

export function CalculatorSection() {
  return (
    <div id="calculadora" className="scroll-mt-20 bg-[#f4eddf] text-[#172019]">
      <div className="mx-auto grid max-w-[1600px] px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-14 xl:px-20">
        <section aria-labelledby="calculadora-titulo" className="flex min-h-[calc(100svh-80px)] flex-col justify-center py-8 lg:py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#58715e]">05 · Simulador de economia</p>
          <h2 id="calculadora-titulo" className="mt-5 max-w-2xl text-[clamp(3rem,4.7vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.07em]">
            Sua economia, <span className="text-[#3b6948]">em números.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#596259] sm:text-lg">
            Digite o valor da sua conta e veja uma estimativa mensal e anual. O cálculo considera encargos e consumo mínimo, por isso o resultado pode variar.
          </p>
          <p className="mt-8 max-w-lg border-t border-[#d5cbb7] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b7168]">Informe a conta · Confira sua estimativa</p>
        </section>

        <section aria-label="Calculadora de economia" className="flex min-h-[calc(100svh-80px)] min-w-0 items-center py-6 lg:py-6">
          <div className="w-full rounded-[1.5rem] border border-[#d5cbb7] bg-[#fbf9f3] p-5 sm:p-7 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#e1dacb] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#617366]">Simulação</span>
              <span className="text-xs text-[#6b7168]">Sem compromisso</span>
            </div>
            <EconomyCalculator />
          </div>
        </section>
      </div>
    </div>
  );
}
