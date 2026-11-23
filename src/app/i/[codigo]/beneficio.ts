/** Valor em reais que o AIOS devolve em `valorIndicado`, ou null quando o campo não veio ou não é um número positivo. */
export function lerValorIndicado(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null
}

/** "R$ 50" quando redondo, "R$ 37,50" quando tem centavos. */
export function formatarValor(valor: number): string {
  const centavos = Math.round(valor * 100) % 100 !== 0
  return valor
    .toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: centavos ? 2 : 0, maximumFractionDigits: 2 })
    .replace(/\s/g, " ")
}
