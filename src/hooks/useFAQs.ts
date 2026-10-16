import { PUBLIC_DISCOUNT_LABEL } from '@/lib/public-discount';

export interface FAQ {
  question: string;
  answer: string;
}

// FAQs padrão como fallback
const DEFAULT_FAQS: FAQ[] = [
  {
    question: "O que é energia solar por assinatura?",
    answer: "É um modelo onde você recebe energia de uma usina solar remota e paga um valor menor do que pagaria para a concessionária. Não precisa instalar nada na sua casa ou empresa - a economia vem direto na sua conta de luz.",
  },
  {
    question: "Preciso instalar painéis solares na minha casa?",
    answer: "Não! Esse é o diferencial da energia por assinatura. A energia é gerada em nossas usinas solares e os créditos são compensados na sua conta de luz. Você economiza sem nenhuma obra ou instalação.",
  },
  {
    question: "Quanto vou economizar na minha conta de luz?",
    answer: `O desconto é de ${PUBLIC_DISCOUNT_LABEL} sobre a energia compensada. A economia na fatura total varia conforme consumo, encargos e tributos. Faça uma simulação para obter uma estimativa.`,
  },
  {
    question: "Existe algum custo de adesão ou mensalidade?",
    answer: "Não há custo de adesão nem mensalidade fixa. Você paga apenas pela energia que consome, sempre com desconto em relação à tarifa normal da concessionária.",
  },
  {
    question: "Qual é o prazo de contrato?",
    answer: "Nossos contratos têm duração de 5 anos, garantindo economia a longo prazo. Durante esse período, você tem a segurança de manter sua economia independente de aumentos nas tarifas.",
  },
  {
    question: "Como funciona o processo de adesão?",
    answer: "É 100% digital! Após fazer a simulação, você recebe uma proposta personalizada. Se aceitar, assina o contrato digitalmente e nós cuidamos de toda a parte técnica com a concessionária.",
  },
];

export function useFAQs() {
  return { faqs: DEFAULT_FAQS, loading: false };
}
