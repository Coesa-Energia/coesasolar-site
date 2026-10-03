// Primeiro segmento de cada rota do app herdado do Lovable (src/App.tsx).
// A rota catch-all do Next só entrega o SPA para estes prefixos; qualquer outro
// caminho responde 404 real (antes respondia 200 com a home — soft-404 sitewide).
// spa-routes.regression.test.ts garante que esta lista acompanha o App.tsx.
export const SPA_ROUTE_PREFIXES = new Set([
  'auth',
  'proposta',
  'proposta-definitiva',
  'proposta-inicial',
  'solicitar-contrato',
  'solicitar-proposta-definitiva',
])

export function isSpaRoute(slug: string[] | undefined): boolean {
  return !!slug?.length && SPA_ROUTE_PREFIXES.has(slug[0])
}
