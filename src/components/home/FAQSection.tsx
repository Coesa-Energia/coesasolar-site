import { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFAQs } from "@/hooks/useFAQs";

export function FAQSection() {
  const { faqs } = useFAQs();
  const [openItem, setOpenItem] = useState("");

  return (
    <section id="faq" aria-labelledby="faq-titulo" className="scroll-mt-20 bg-[#e9eee9] text-[#17251b]">
      <div className="mx-auto grid max-w-[1600px] gap-6 px-5 py-7 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[0.7fr_1fr] lg:items-center lg:gap-16 lg:px-14 lg:py-8 xl:px-20">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:self-start lg:pt-10"
        >
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#617b64]">16 · Dúvidas frequentes</p>
          <h2 id="faq-titulo" className="text-[clamp(3.2rem,5vw,6rem)] font-medium leading-[0.94] tracking-[-0.07em]">Tudo mais <span className="text-[#467653]">claro.</span></h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[#5c695d]">Respostas diretas sobre sua conta, a assinatura e a energia que chega pela rede.</p>
        </motion.div>

        <motion.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="min-w-0 border-t border-[#b9c8b9]"
        >
          {/* As perguntas e respostas saem no HTML do servidor. forceMount mantém a resposta fechada no DOM; o hidden
              controlado é obrigatório porque o Radix não esconde conteúdo forçado. */}
            <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-[#b9c8b9] px-1"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-medium tracking-[-0.02em] hover:no-underline sm:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent forceMount hidden={openItem !== `item-${index}`} className="pb-5 text-sm leading-relaxed text-[#5c695d]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
