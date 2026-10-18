export type Part = { kind: "word"; word: string; accent: boolean } | { kind: "image"; src: string; alt: string };
const words = (text: string, accent = false): Part[] => text.split(" ").map((word) => ({ kind: "word", word, accent }));

// Sequência e intervalos seguem a seção 03-manifesto do Gridora fornecida pelo usuário.
export const parts: Part[] = [
  ...words("A maneira com que você se locomove na cidade, mudou."),
  { kind: "image", src: "/coesa-hero/uber-logo.png", alt: "Uber" },
  ...words("O jeito que você se comunica, já não é mais o mesmo."),
  { kind: "image", src: "/coesa-hero/whatsapp-logo.png", alt: "WhatsApp" },
  ...words("A maneira com que você assiste filmes e séries também."),
  { kind: "image", src: "/coesa-hero/netflix-logo.png", alt: "Netflix" },
  ...words("Por que só a nossa maneira de pensar energia é a mesma?", true),
  { kind: "image", src: "/favicon.png", alt: "Raio da COESA" },
  ...words("COESA Energia Inteligente:"),
  ...words("Sem placas, obras ou investimento inicial. Desconto na sua conta luz.", true),
];
