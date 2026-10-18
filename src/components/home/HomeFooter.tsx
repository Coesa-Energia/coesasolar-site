"use client";

import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle } from "lucide-react";
import { COESA_ADDRESS_LINE, COESA_COMPANY } from "@/lib/coesa-company";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import coesaLogoWhite from "@/assets/logos/coesa-white-new.png";
import Image from "next/image";
import Script from "next/script";

const footerLinkClass = "text-[#a5b4a7] transition-colors hover:text-white";

export function HomeFooter({ compact = false }: { compact?: boolean }) {
  const currentYear = new Date().getFullYear();
  const { configs } = useConfiguracoes();

  return (
    <footer className="overflow-hidden bg-[#102418] text-[#f3f5ed]">
      <div className={`container mx-auto px-5 md:px-8 ${compact ? "pt-12" : "pt-16 lg:pt-24"}`}>
        <div className={`grid gap-11 md:grid-cols-2 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))] ${compact ? "pb-12" : "pb-16 lg:pb-24"}`}>
          <div>
            <Image src={coesaLogoWhite} alt={configs.empresa_nome} width={192} height={108} className="mb-7 h-11 w-auto" />
            <p className="max-w-sm text-base leading-relaxed text-[#a5b4a7]">
              Energia solar por assinatura para economizar sem placas, obras ou investimento.
            </p>
            <a href="/#calculadora" className="mt-8 inline-flex min-h-12 items-center gap-4 rounded-full border border-white/15 bg-white/10 px-6 text-sm font-medium transition-colors hover:bg-white/20">
              Simular economia <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div>
            <h3 className="mb-7 text-sm font-semibold">Explore</h3>
            <ul className="space-y-4 text-sm">
              {[
                { label: "Início", href: "/#inicio" },
                { label: "Benefícios", href: "/#beneficios" },
                { label: "Planos", href: "/#planos" },
                { label: "Como Funciona", href: "/#como-funciona" },
              ].map(({ label, href }) => (
                <li key={href}><a href={href} className={footerLinkClass}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-7 text-sm font-semibold">COESA</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="/blog" className={footerLinkClass}>Blog</a></li>
              <li><a href="/carreiras" className={footerLinkClass}>Carreiras</a></li>
              <li><a href="/#faq" className={footerLinkClass}>Perguntas frequentes</a></li>
              <li><a href="/energia-solar-por-assinatura-minas-gerais" className={footerLinkClass}>Energia solar em MG</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-7 text-sm font-semibold">Contato</h3>
            <ul className="space-y-4 text-sm text-[#a5b4a7]">
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><a href="mailto:contato@coesaenergia.com.br" className="transition-colors hover:text-white">contato@coesaenergia.com.br</a></li>
              <li className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0" /><a href={`https://wa.me/${COESA_COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">WhatsApp {COESA_COMPANY.phoneDisplay}</a></li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><address className="not-italic">{COESA_ADDRESS_LINE}</address></li>
            </ul>
            <div className="mt-6 flex gap-2">
              {[
                { href: configs.rede_social_instagram, label: "Instagram da COESA", Icon: Instagram },
                { href: configs.rede_social_linkedin, label: "LinkedIn da COESA", Icon: Linkedin },
                { href: configs.rede_social_facebook, label: "Facebook da COESA", Icon: Facebook },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#a5b4a7] transition-colors hover:border-white/40 hover:text-white"><Icon className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-10">
          <a href="https://cfgauss.com.br" target="_blank" rel="noopener noreferrer" aria-label="Powered by CF Gauss, abrir site" className="group inline-flex min-h-14 items-center gap-3 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2 transition-colors hover:border-white/30 hover:bg-white/[0.07]">
            <Image src="/brands/cf-gauss-horizontal-inverse.png" alt="CF Gauss" width={112} height={45} className="h-10 w-auto" />
            <span className="h-7 w-px bg-white/15" aria-hidden="true" />
            <span className="flex flex-col gap-0.5 text-left uppercase">
              <span className="text-[9px] tracking-[0.18em] text-[#8b9d8f]">Powered by</span>
              <span className="text-[10px] font-medium tracking-[0.08em] text-[#d0dbd0]">CFGAUSS.COM.BR</span>
            </span>
          </a>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 text-xs text-[#8b9d8f]">
            <p>© {currentYear} {configs.empresa_nome}. Todos os direitos reservados.</p>
            <p>{COESA_COMPANY.legalName} · CNPJ {COESA_COMPANY.cnpj}</p>
            <a href="https://www.reclameaqui.com.br/rav/p1b9" target="_blank" rel="noopener noreferrer" aria-label="Ver selo da Coesa no Reclame Aqui" className="flex min-h-8 items-center">
              <div id="ra-verified-seal">
                <Script id="ra-embed-verified-seal" src="https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js" strategy="lazyOnload" data-id="b2xrYlJDLXFqSlROcmFuTTpjb2VzYS1lbmVyZ2lhLWludGVsaWdlbnRl" data-target="ra-verified-seal" data-model="horizontal_1" />
              </div>
            </a>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none -mb-[0.08em] select-none overflow-hidden text-center font-semibold leading-[0.74] tracking-[-0.085em] text-[#326d3d] [font-size:21vw] lg:[font-size:25vw] [mask-image:linear-gradient(to_bottom,black_18%,transparent_100%)]">
        COESA
      </div>
    </footer>
  );
}
