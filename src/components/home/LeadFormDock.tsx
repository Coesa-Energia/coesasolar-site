"use client";

import { FormEvent, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatLeadBill, formatLeadBillInput, openLeadForm, trackLeadEvent, type LeadPrefill } from "@/lib/lead-funnel";
import { formatarWhatsapp } from "@/lib/carreiras/form-utils";

const SimulationForm = dynamic(() => import("./SimulationForm").then(({ SimulationForm }) => SimulationForm), { ssr: false });

export function CompactLeadForm() {
  const [whatsapp, setWhatsapp] = useState("");
  const [valor, setValor] = useState("");

  const abrirFormularioCompleto = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    openLeadForm("hero_form", { telefone: whatsapp, valorConta: formatLeadBill(valor) });
  };

  return (
    <form onSubmit={abrirFormularioCompleto} className="mx-auto w-full max-w-xl rounded-2xl border border-white/25 bg-[#101c16]/90 p-4 text-left shadow-[0_16px_50px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:p-5">
      <p className="mb-3 text-base font-medium text-white">Comece sua simulação</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <label className="sr-only" htmlFor="hero-whatsapp">WhatsApp</label>
        <input id="hero-whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(formatarWhatsapp(event.target.value))} placeholder="(00) 00000-0000" inputMode="tel" autoComplete="tel" required className="h-11 rounded-md border border-white/15 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ded7c5]" />
        <label className="sr-only" htmlFor="hero-valor">Valor da conta</label>
        <input id="hero-valor" value={valor} onChange={(event) => setValor(formatLeadBillInput(event.target.value))} onBlur={() => setValor(formatLeadBill(valor))} placeholder="R$ 0,00" inputMode="decimal" required className="h-11 rounded-md border border-white/15 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ded7c5]" />
        <button type="submit" className="h-11 rounded-md border border-[#f3eee3] bg-[#f3eee3] px-5 text-sm font-semibold text-[#11130f] transition hover:bg-white">Continuar →</button>
      </div>
      <p className="pt-2 text-[11px] text-white/65">Seus dados seguem preenchidos na próxima etapa.</p>
    </form>
  );
}

/** Opção B: formulário em tela inteira, aberto somente pelo CTA principal. */
export function LeadFormDock() {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<LeadPrefill>({});
  const [source, setSource] = useState("site");

  useEffect(() => {
    const openForm = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string; prefill?: LeadPrefill }>).detail;
      setPrefill(detail?.prefill ?? {});
      setSource(detail?.source ?? "site");
      trackLeadEvent("lead_form_open", detail?.source ?? "site");
      setOpen(true);
    };
    window.addEventListener("coesa:open-lead-form", openForm);
    return () => window.removeEventListener("coesa:open-lead-form", openForm);
  }, []);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 48 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#101612]"
            aria-label="Formulário de simulação"
          >
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 text-white sm:px-8 lg:px-12 lg:py-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#85d99e]">
                  COESA / Simulação
                </p>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white" aria-label="Fechar simulação">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_30rem] lg:gap-20">
                <div className="max-w-xl">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#85d99e]">Comece pelo digital</p>
                  <h2 className="mt-4 text-4xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl">Sua conta de luz pode ser mais simples.</h2>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">Conte onde você está e quanto paga. A COESA verifica sua economia e responde pelo WhatsApp.</p>
                  <div className="mt-10 grid max-w-md grid-cols-2 gap-5 border-t border-white/10 pt-5 text-sm text-white/55">
                    <span><strong className="block text-2xl font-medium text-white">R$ 0</strong>de adesão</span>
                    <span><strong className="block text-2xl font-medium text-white">100%</strong>digital</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 shadow-2xl">
                  <SimulationForm prefill={prefill} source={source} />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
