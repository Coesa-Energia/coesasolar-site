"use client";

import { ArrowUpRight, CircleHelp, ClipboardList, House, ReceiptText, Tag, Zap } from "lucide-react";
import { CoesaLogo } from "@/components/CoesaLogo";
import { GridoraShowcaseRail } from "./GridoraShowcaseRail";

type View = "app" | "portal";

const invoices = [
  { month: "Setembro de 2026", saving: "R$ 104,00", amount: "R$ 457,00", status: "A vencer", due: "20 de outubro de 2026" },
  { month: "Agosto de 2026", saving: "R$ 113,40", amount: "R$ 494,60", status: "Paga", due: "20 de setembro de 2026" },
  { month: "Julho de 2026", saving: "R$ 122,80", amount: "R$ 532,20", status: "Paga", due: "20 de agosto de 2026" },
];

const navigation = [
  { label: "Início", icon: House, screen: "inicio" },
  { label: "Faturas", icon: ReceiptText, screen: "faturas" },
  { label: "Plano", icon: Tag, screen: "plano" },
  { label: "Serviços", icon: ClipboardList, screen: undefined },
  { label: "Ajuda", icon: CircleHelp, screen: undefined },
] as const;

function ReceiptCard({ view }: { view: View }) {
  return (
    <div className={`rounded-[1.55rem] bg-white text-[#132923] shadow-[0_12px_36px_rgba(0,52,37,0.08)] ${view === "app" ? "p-5" : "p-7"}`}>
      <p className="flex items-center gap-2 text-[13px] font-semibold text-[#50615a]"><Zap className="h-4 w-4 text-[#00543a]" />Comprovante de economia</p>
      <p className={`text-[#1a2d27] ${view === "app" ? "mt-4 text-[15px]" : "mt-8 text-lg"}`}>Você já economizou</p>
      <p className={`whitespace-nowrap font-semibold leading-none tracking-[-0.07em] text-[#00543a] ${view === "app" ? "mt-1 text-[39px]" : "mt-1 text-[clamp(2.3rem,4vw,4rem)]"}`}>R$ 2.394,00</p>
      <p className={`text-[#5a6b64] ${view === "app" ? "mt-2 text-[12px]" : "mt-3 text-sm"}`}>desde que começou com a Coesa</p>
      <div className={`border-t border-dashed border-[#cdd8d2] ${view === "app" ? "mt-5 pt-4 text-[11px]" : "mt-8 pt-5 text-sm"}`}>
        <div className="flex items-baseline justify-between gap-3"><span>Última fatura (set/2026)</span><strong className="shrink-0">R$ 104,00</strong></div>
        <div className="mt-3 flex items-baseline justify-between gap-3"><span>Em 2026</span><strong className="shrink-0">R$ 1.022,40</strong></div>
      </div>
      <p className={`leading-relaxed text-[#6b7972] ${view === "app" ? "mt-4 text-[10px]" : "mt-7 text-xs"}`}>Conta feita com as suas faturas: valor da energia × o seu desconto.</p>
    </div>
  );
}

function InvoiceList({ view }: { view: View }) {
  return <div className="overflow-hidden rounded-[1.4rem] border border-[#d9e2dd] bg-white">
    {invoices.map((invoice) => <div key={invoice.month} className={view === "app" ? "border-b border-[#dfe7e2] px-4 py-[14px] last:border-0" : "flex items-center justify-between gap-3 border-b border-[#dfe7e2] px-6 py-4 last:border-0"}>
      <div><strong className="block text-[13px] text-[#162d25]">{invoice.month}</strong><span className="mt-1 block text-[11px] text-[#006043]">Você economizou {invoice.saving}</span></div>
      <div className={view === "app" ? "mt-2 flex items-center gap-2" : "text-right"}><strong className="text-[13px]">{invoice.amount}</strong><span className={(view === "app" ? "ml-1" : "mt-1 block") + " rounded-full px-2 py-0.5 text-[10px] " + (invoice.status === "Paga" ? "bg-[#e6f3ea] text-[#006043]" : "bg-[#fff1cf] text-[#825a00]")}>{invoice.status}</span></div>
    </div>)}
  </div>;
}

function PlanCard({ view }: { view: View }) {
  return (
    <div className={`rounded-[1.55rem] bg-white text-[#132923] ${view === "app" ? "p-5" : "p-7"}`}>
      <h4 className={`font-semibold text-[#00543a] ${view === "app" ? "text-[17px]" : "text-2xl"}`}>Desconto e seu plano</h4>
      <div className="mt-4 flex items-center gap-4">
        <span className={`shrink-0 rounded-xl bg-[#ffb000] font-bold leading-none ${view === "app" ? "px-3 py-3 text-[32px]" : "px-4 py-4 text-[42px]"}`}>20%<small className="mt-1 block text-[11px]">de desconto</small></span>
        <p className={`leading-relaxed ${view === "app" ? "text-xs" : "text-base"}`}>na energia que você recebe da Coesa.</p>
      </div>
      <div className="mt-5 border-t border-[#dce4df] pt-4">
        <p className={view === "app" ? "text-[13px]" : "text-base"}>Seu plano está <strong>ativo</strong></p>
        <div className="mt-3 h-2 rounded-full bg-[#dce6e0]"><div className="h-full w-3/5 rounded-full bg-[#00543a]" /></div>
        <p className={`mt-3 text-[#617168] ${view === "app" ? "text-[11px]" : "text-sm"}`}>Acompanhe suas condições na Área do Cliente.</p>
      </div>
      {view === "portal" && <div className="mt-4 border-t border-[#dce4df] pt-4">
        <p className="text-base font-semibold text-[#00543a]">Sua conta de luz</p>
        <p className="mt-2 text-sm">1 instalação <span className="ml-1 rounded-full bg-[#e6f3ea] px-3 py-1 font-semibold text-[#006043]">Ativa</span></p>
      </div>}
    </div>
  );
}

function InvoiceDetail({ invoice }: { invoice: (typeof invoices)[number] }) {
  return <div className="rounded-[1.4rem] bg-white p-5 text-[#132923]">
    <span className="inline-flex rounded-full bg-[#fff1cf] px-3 py-1 text-xs font-semibold text-[#825a00]">{invoice.status}</span>
    <p className="mt-4 text-sm text-[#5c6c63]">Valor da fatura</p>
    <p className="mt-1 text-[50px] font-semibold leading-none tracking-[-0.06em] text-[#00543a]">{invoice.amount}</p>
    <div className="mt-4 border-t border-[#dce4df] pt-3"><p className="text-sm text-[#5c6c63]">Vencimento</p><strong className="mt-1 block text-base">{invoice.due}</strong></div>
    <div className="mt-3 border-t border-[#dce4df] pt-3"><p className="text-sm text-[#5c6c63]">Você economizou nesta fatura</p><strong className="mt-1 block text-xl text-[#00543a]">{invoice.saving}</strong></div>
  </div>;
}

function AppPhone({ screen }: { screen: "inicio" | "faturas" | "plano" }) {
  const heading = screen === "inicio" ? "Olá, Ana!" : screen === "faturas" ? "Suas faturas" : "Seu plano";
  const subtitle = screen === "inicio" ? "Cliente Coesa desde janeiro de 2025" : screen === "faturas" ? "Mês a mês, com a economia de cada uma" : "Desconto e suas contas de luz";
  return <div className="relative mx-auto flex h-[580px] w-[268px] shrink-0 flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-[#0d1511] bg-[#f2f5f3] shadow-[0_25px_55px_rgba(0,0,0,0.28)]" aria-label={"Tela do app: " + heading}>
    <div className="absolute left-1/2 top-2 z-30 h-[18px] w-24 -translate-x-1/2 rounded-full bg-[#0b110e]" />
    <div className="relative h-[205px] shrink-0 overflow-hidden bg-[#004b35] px-4 pt-8 text-white"><div className="absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-[#ffb000]" /><div className="relative flex items-center justify-between"><CoesaLogo variant="white" className="h-6 max-w-[105px]" /><span className="rounded-lg border border-white/65 px-2 py-1 text-[10px]">↪ Sair</span></div><h3 className="relative mt-10 text-[29px] font-medium leading-none tracking-[-0.05em]">{heading}</h3><p className="relative mt-2 max-w-[210px] text-[11px] leading-snug text-white/80">{subtitle}</p></div>
    <div className="relative z-10 -mt-7 min-h-0 flex-1 px-3">{screen === "inicio" ? <ReceiptCard view="app" /> : screen === "faturas" ? <InvoiceList view="app" /> : <PlanCard view="app" />}</div>
    <div className="relative z-20 grid shrink-0 grid-cols-5 border-t border-[#dce4df] bg-white px-1 pb-3 pt-2 text-center">{navigation.map(({ label, icon: Icon }) => <div key={label} className={(label.toLowerCase() === screen ? "font-semibold text-[#00543a]" : "text-[#66786e]") + " flex flex-col items-center gap-0.5 text-[9px]"}><span className={(label.toLowerCase() === screen ? "bg-[#e5f2e9]" : "") + " flex h-7 w-8 items-center justify-center rounded-full"}><Icon className="h-[16px] w-[16px]" /></span>{label}</div>)}</div>
  </div>;
}

function PortalDashboard() {
  return <div className="mx-auto flex h-auto w-full max-w-[875px] sm:h-[520px] overflow-hidden rounded-[1.1rem] border-[7px] border-[#101713] bg-[#f2f5f3] shadow-[0_28px_60px_rgba(20,32,25,0.25)]" aria-label="Painel desktop da Área do Cliente">
    <div className="hidden w-[150px] shrink-0 flex-col bg-[#003b2b] px-3 py-6 text-white sm:flex"><CoesaLogo variant="white" className="mx-auto h-8 max-w-[115px]" /><div className="mt-9 space-y-1">{navigation.map(({ label, icon: Icon }) => <div key={label} className={(label === "Início" ? "bg-white font-semibold text-[#00543a]" : "text-white/75") + " flex items-center gap-2 rounded-lg px-3 py-2 text-xs"}><Icon className="h-4 w-4" />{label}</div>)}</div><span className="mt-auto px-3 text-xs text-white/70">↪ Sair</span></div>
    <div className="min-w-0 flex-1"><div className="relative h-[130px] overflow-hidden bg-[#004b35] px-5 py-5 text-white sm:px-7"><div className="absolute -bottom-20 -right-12 h-44 w-44 rounded-full bg-[#ffb000]" /><h3 className="relative text-[clamp(1.6rem,3vw,2.5rem)] leading-none tracking-[-0.04em]">Olá, Ana!</h3><p className="relative mt-2 text-xs text-white/80">Cliente Coesa desde janeiro de 2025</p></div><div className="relative -mt-6 grid gap-3 px-4 pb-6 sm:grid-cols-[1.12fr_0.88fr] sm:px-6"><ReceiptCard view="portal" /><div className="space-y-3"><div className="rounded-[1.3rem] bg-white p-5"><h4 className="text-lg font-semibold text-[#00543a]">Sua fatura</h4><p className="mt-2 text-xs">Setembro de 2026</p><p className="mt-3 text-2xl font-semibold">R$ 457,00</p><p className="mt-2 text-xs">Vencimento: 20 de outubro de 2026</p><span className="mt-3 block rounded-lg bg-[#00543a] px-3 py-2 text-center text-xs font-semibold text-white">Ver fatura</span></div><div className="rounded-[1.3rem] bg-white p-5"><h4 className="text-lg font-semibold text-[#00543a]">Seu plano</h4><p className="mt-2 text-xs"><span className="rounded-lg bg-[#ffb000] px-2 py-1 font-bold">20%</span> de desconto</p></div></div></div></div>
  </div>;
}


function PortalInvoices() {
  return (<div className="mt-4 flex min-h-[470px] w-full overflow-hidden rounded-[1.15rem] border-[7px] border-[#111915] bg-[#f2f5f3] shadow-[0_26px_55px_rgba(21,45,31,0.17)]" aria-label="Prévia das faturas na Área do Cliente"><div className="flex w-[185px] shrink-0 flex-col bg-[#003b2b] px-4 py-7 text-white"><CoesaLogo variant="white" className="mx-auto h-9 max-w-[125px]" /><div className="mt-10 space-y-1">{navigation.map(({ label, icon: Icon }) => <div key={label} className={(label === "Faturas" ? "bg-white font-semibold text-[#00543a]" : "text-white/75") + " flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"}><Icon className="h-4 w-4" />{label}</div>)}</div><span className="mt-auto px-3 text-sm text-white/70">↪ Sair</span></div><div className="min-w-0 flex-1"><div className="relative overflow-hidden bg-[#004b35] px-8 py-6 text-white"><div className="absolute -bottom-24 -right-10 h-44 w-44 rounded-full bg-[#ffb000]" /><h3 className="relative text-[40px] font-medium tracking-[-0.04em]">Suas faturas</h3><p className="relative mt-1 text-sm text-white/80">Mês a mês, com a economia de cada uma</p></div><div className="grid grid-cols-[0.9fr_1.1fr] gap-4 p-4"><div><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#648074]">Histórico de 2026</p><InvoiceList view="portal" /></div><div><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#648074]">Setembro · detalhe da fatura</p><InvoiceDetail invoice={invoices[0]} /></div></div></div></div>);
}

function PortalShowcaseCard({ kind }: { kind: "painel" | "faturas" }) {
  const isPanel = kind === "painel";
  return <div id={isPanel ? undefined : "area-do-cliente-detalhes"} className="grid h-full grid-cols-[0.55fr_1fr] items-center gap-4 p-8">
    <div className="flex h-full flex-col"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#eaf2e9] px-3 py-1 text-xs text-[#245d39]">{isPanel ? "Painel" : "Faturas"}</span><span className="font-mono text-xs text-[#7b877b]">{isPanel ? "01" : "02"} / 02</span></div><h3 id={isPanel ? undefined : "area-do-cliente-detalhes-titulo"} className="mt-8 text-[clamp(2rem,2.7vw,2.8rem)] font-light leading-tight tracking-[-0.04em]">{isPanel ? "Sua conta. Seu controle." : "A economia aparece em cada fatura."}</h3><p className="mt-4 text-sm leading-relaxed text-[#667369]">{isPanel ? "Economia acumulada, próxima fatura e plano em um só lugar." : "Histórico e economia, mês a mês."}</p><p className="mt-auto pt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7b877b]">{isPanel ? "Painel ilustrativo" : "Demonstração visual"} · dados de exemplo</p></div>
    <div className="flex min-w-0 items-center justify-center"><div className="w-[875px] shrink-0" style={{ zoom: 0.62 }}>{isPanel ? <PortalDashboard /> : <PortalInvoices />}</div></div>
  </div>;
}

const appScreens = ["inicio", "faturas", "plano"] as const;
const appLabels = ["Economia", "Faturas", "Plano"] as const;

export function ClientAreaSection() {
  return <>
    <div id="app-coesa" className="scroll-mt-20">
      <div className="hidden lg:block" aria-label="Três telas do app COESA">
        <GridoraShowcaseRail
          tone="dark" direction="left" titleId="app-coesa-titulo" eyebrow="09 · App COESA"
          title="Sua energia. Na palma da mão." subtitle="Economia, faturas e plano."
          intro={<p className="text-lg leading-relaxed">Acompanhe sua economia acumulada, as faturas e o plano. Tudo à vista, no seu ritmo.</p>}
          labels={appLabels}
          cards={appScreens.map((screen, index) => <div key={screen} className="relative flex h-full flex-col overflow-hidden p-7 lg:grid lg:grid-cols-[0.82fr_1fr] lg:gap-7 lg:p-10">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/coesa-hero/hero-turbine.jpg')] bg-cover bg-center opacity-35" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#173c2e] via-[#173c2e]/90 to-[#173c2e]/30" />
            <div className="flex flex-col"><div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/15">{appLabels[index]}</span><span className="font-mono text-xs text-white/60">0{index + 1} / 03</span></div><h3 className="mt-8 text-[clamp(2rem,3vw,3rem)] font-light leading-tight tracking-[-0.04em]">{screen === "inicio" ? "Sua economia, sempre à vista." : screen === "faturas" ? "Cada fatura, com tudo claro." : "Seu desconto e seu plano."}</h3><p className="mt-5 text-base leading-relaxed text-white/75">{screen === "inicio" ? "Veja quanto já economizou desde que chegou à COESA." : screen === "faturas" ? "Acompanhe cada mês e a economia de cada conta." : "Confira o desconto de 20% e as condições do seu plano."}</p><p className="mt-auto pt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">Telas ilustrativas · dados de exemplo</p></div>
            <div className="flex justify-center self-center [zoom:0.82] [@media(max-height:820px)]:[zoom:0.55]"><AppPhone screen={screen} /></div>
          </div>)}
        />
      </div>
      {(["inicio", "faturas", "plano"] as const).map((item, index) => <section key={item} aria-label={`App COESA: ${item}`} className="flex min-h-[calc(100svh-80px)] flex-col items-center justify-center gap-1 bg-[#10251d] px-5 py-2 text-white lg:hidden">
        <div className="w-full max-w-[320px]"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9cb0a2]">09 · App COESA / 0{index + 1} · Tela ilustrativa</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.06em]">{item === "inicio" ? "Sua economia." : item === "faturas" ? "Suas faturas." : "Seu plano."}</h2>{index === 0 && <p className="mt-1 text-xs text-[#bfcdc3]">Economia, faturas e plano na palma da mão.</p>}</div>
        <figure><AppPhone screen={item} /></figure>
      </section>)}
    </div>
    <div id="area-do-cliente" className="scroll-mt-20">
      <div className="hidden lg:block">
        <GridoraShowcaseRail
          direction="right" titleId="area-do-cliente-titulo" eyebrow="10 · Área do Cliente"
          title="Sua conta. Seu controle." subtitle="Tudo claro, em um só lugar."
          intro={<div><p className="text-lg leading-relaxed">Acompanhe o valor economizado, a próxima fatura e seu plano.</p><a href="https://relatorios.coesasolar.com.br/" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full border border-[#becbbf] px-5 py-3 text-sm font-medium text-[#00543a]">Acessar Área do Cliente<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></div>}
          labels={["Painel", "Faturas"]}
          cards={[<PortalShowcaseCard key="painel" kind="painel" />, <PortalShowcaseCard key="faturas" kind="faturas" />]}
        />
      </div>
      <section aria-labelledby="portal-mobile-titulo" className="flex min-h-[calc(100svh-80px)] flex-col justify-center bg-[#f5efe3] px-5 py-3 text-[#17231c] lg:hidden"><div className="mx-auto w-full max-w-[420px]"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64786a]">10 · Área do Cliente</p><h2 id="portal-mobile-titulo" className="mt-2 text-[2.6rem] font-medium leading-none tracking-[-0.07em]">Sua conta.<br />Seu controle.</h2><p className="mt-3 text-sm leading-relaxed text-[#667369]">Economia, próxima fatura e plano em uma visão organizada.</p><div className="mt-4 rounded-[1.2rem] border-[5px] border-[#111915] bg-[#f2f5f3] p-3"><div className="rounded-xl bg-[#004b35] px-4 py-3 text-white"><strong className="text-xl">Olá, Ana!</strong><p className="text-xs text-white/75">Cliente COESA desde janeiro de 2025</p></div><div className="mt-2"><ReceiptCard view="app" /></div><div className="mt-2 flex justify-between rounded-xl bg-white px-4 py-3 text-xs"><span>Próxima fatura<br /><strong>R$ 457,00</strong></span><span>Plano ativo<br /><strong>20% de desconto</strong></span></div></div><a href="https://relatorios.coesasolar.com.br/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-3 rounded-full border border-[#becbbf] px-5 text-sm font-medium text-[#00543a]">Acessar Área do Cliente<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#7b877b]">Painel ilustrativo · dados de exemplo</p></div></section>
    </div>
    <div className="lg:hidden" id="area-do-cliente-detalhes-mobile">
      <section aria-labelledby="faturas-mobile-titulo" className="flex min-h-[calc(100svh-80px)] flex-col justify-center bg-[#e9eee9] px-5 py-6 text-[#17231c] lg:hidden"><div className="mx-auto w-full max-w-[420px]"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64786a]">11 · Área do Cliente</p><h2 id="faturas-mobile-titulo" className="mt-2 text-[2.5rem] font-medium leading-none tracking-[-0.06em]">Faturas, mês a mês.</h2><p className="mt-2 text-sm text-[#667369]">A economia aparece em cada conta.</p><div className="mt-5 rounded-[1.1rem] border-[5px] border-[#111915] bg-[#f2f5f3] p-3"><div className="rounded-xl bg-[#004b35] p-4 text-white"><strong>Suas faturas</strong><p className="text-xs text-white/75">Histórico de 2026</p></div><div className="mt-3"><InvoiceList view="app" /></div></div><p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#788a7d]">Demonstração visual · dados ilustrativos</p></div></section>
      <section aria-labelledby="fatura-detalhe-mobile-titulo" className="flex min-h-[calc(100svh-80px)] flex-col justify-center bg-[#e9eee9] px-5 py-6 text-[#17231c] lg:hidden"><div className="mx-auto w-full max-w-[420px]"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64786a]">11 · Detalhe da fatura</p><h2 id="fatura-detalhe-mobile-titulo" className="mt-2 text-[2.5rem] font-medium leading-none tracking-[-0.06em]">Cada detalhe, claro.</h2><p className="mt-2 text-sm text-[#667369]">Setembro de 2026 · dados ilustrativos</p><div className="mt-5 rounded-[1.1rem] border-[5px] border-[#111915] bg-[#f2f5f3] p-3"><InvoiceDetail invoice={invoices[0]} /></div></div></section>
    </div>
  </>;
}
