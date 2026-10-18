"use client";

import { ExternalLink, Headphones, Play } from "lucide-react";
import * as motion from "framer-motion/m";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const pressItems = [
  {
    source: "O Tempo",
    title: "Energia por assinatura faz Minas Gerais liderar setor no Brasil",
    href: "https://www.otempo.com.br/minas-sa/2025/11/12/energia-por-assinatura-faz-minas-gerais-liderar-setor-no-brasil",
    logo: "/media/press/o-tempo.svg",
    type: "article",
  },
  {
    source: "BM&C News",
    title: "Energia por assinatura se consolida como motor da transição energética",
    href: "https://bmcnews.com.br/petroleo-e-energia/energia-por-assinatura-se-consolida-como-motor-da-transicao-energetica/",
    logo: "/media/press/bmc-news.png",
    type: "article",
  },
  {
    source: "Times Brasil — CNBC",
    title: "COESA em entrevista com a Times Brasil",
    href: "https://www.youtube.com/watch?v=l9xkUcINWdY",
    logo: "/media/press/times-brasil.svg",
    darkOnWhite: true,
    type: "video",
  },
  {
    source: "Revista Potência",
    title: "Transição energética pauta a COP30 e acelera corrida por novos modelos de energia limpa",
    href: "https://revistapotencia.com.br/portal-potencia/energia/transicao-energetica-pauta-a-cop30-e-acelera-corrida-por-novos-modelos-de-energia-limpa/",
    logo: "/media/press/revista-potencia.png",
    type: "article",
  },
  {
    source: "YouTube",
    title: "Entenda a energia solar por assinatura e suas vantagens",
    href: "https://www.youtube.com/watch?v=Z0MGJP2Ot-w",
    logo: "/media/press/youtube.svg",
    type: "video",
  },
  {
    source: "Diário do Comércio",
    title: "Modelo de assinatura solar cresce com COP30 e cenário favorável à transição energética",
    href: "https://diariodocomercio.com.br/negocios/modelo-assinatura-solar-cresce-cop30/",
    logo: "/media/press/diario-do-comercio.svg",
    type: "article",
  },
  {
    source: "R7 — Mundo Agro",
    title: "Energia solar por assinatura avança no campo e alivia custos do produtor rural",
    href: "https://noticias.r7.com/prisma/mundo-agro/energia-solar-por-assinatura-avanca-no-campo-e-alivia-custos-do-produtor-rural-23012026/",
    logo: "/media/press/r7.svg",
    darkOnWhite: true,
    type: "article",
  },
  {
    source: "Agrotempo — Spotify",
    title: "Produtor rural pode economizar até 25% da conta de luz com energia solar por assinatura",
    href: "https://open.spotify.com/episode/2Y8JDmhjzAytyhELl9Dtmj",
    logo: "/media/press/spotify.png",
    type: "podcast",
  },
  {
    source: "YouTube",
    title: "Energia solar por assinatura se torna alternativa para produtores rurais",
    href: "https://www.youtube.com/watch?v=_-yk8-Pm7CQ",
    logo: "/media/press/youtube.svg",
    type: "video",
  },
] as const;

const mediaLabel = {
  article: "Ler matéria",
  video: "Assistir vídeo",
  podcast: "Ouvir episódio",
};

export function PressSection() {
  return (
    <section id="imprensa" aria-labelledby="imprensa-titulo" className="scroll-mt-20 overflow-hidden bg-[#e8ede5] text-[#17251b]">
      <div className="mx-auto flex max-w-[1600px] flex-col justify-center px-5 py-14 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:px-14 lg:py-8 xl:px-20">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-9 flex flex-col justify-between gap-6 border-b border-[#b9c8b9] pb-6 md:flex-row md:items-end"
        >
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#617b64]">
              14 · Na imprensa
            </p>
            <h2 id="imprensa-titulo" className="max-w-3xl text-[clamp(3rem,5.2vw,6rem)] font-medium leading-[0.96] tracking-[-0.07em]">
              Energia em <span className="text-[#467653]">pauta.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[#5c695d] md:text-right">
            Notícias, entrevistas e conversas sobre a transformação do mercado de energia.
          </p>
        </motion.div>

        <Carousel
          opts={{ align: "start" }}
          aria-label="Notícias e entrevistas da COESA"
          className="w-full"
        >
          <CarouselContent className="-ml-5">
            {pressItems.map((item, index) => (
              <CarouselItem
                key={item.href}
                className="basis-[88%] pl-5 sm:basis-[56%] lg:basis-1/3"
              >
                <motion.a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${mediaLabel[item.type]}: ${item.title}`}
                  initial={{ y: 24 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
                  className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244433] focus-visible:ring-offset-4 focus-visible:ring-offset-[#e8ede5]"
                >
                  <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[1.2rem] border border-[#b9c8b9] bg-white">
                    <img
                      src={item.logo}
                      alt={`Logomarca ${item.source}`}
                      loading="lazy"
                      className={`h-full w-full object-contain p-12 transition duration-500 ease-out group-hover:scale-[1.035] sm:p-14 ${"darkOnWhite" in item && item.darkOnWhite ? "brightness-0" : ""}`}
                    />
                    {item.type !== "article" && (
                      <span className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-lg transition-transform group-hover:scale-110">
                        {item.type === "video" ? (
                          <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                        ) : (
                          <Headphones className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#617b64]">
                    <span>{item.source}</span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {mediaLabel[item.type]}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-medium leading-snug tracking-[-0.035em] decoration-1 underline-offset-4 group-hover:underline">
                    {item.title}
                  </h3>
                </motion.a>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-8 flex justify-end gap-3">
            <CarouselPrevious
              aria-label="Notícias anteriores"
              className="static h-11 w-11 translate-y-0 border-black/20 bg-transparent hover:bg-black hover:text-white"
            />
            <CarouselNext
              aria-label="Próximas notícias"
              className="static h-11 w-11 translate-y-0 border-black/20 bg-transparent hover:bg-black hover:text-white"
            />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
