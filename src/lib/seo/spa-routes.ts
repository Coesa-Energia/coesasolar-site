// Primeiro segmento de cada rota do app herdado do Lovable (src/App.tsx).
// A rota catch-all do Next só entrega o SPA para estes prefixos; qualquer outro
// caminho responde 404 real (antes respondia 200 com a home — soft-404 sitewide).
// spa-routes.regression.test.ts garante que esta lista acompanha o App.tsx.
export const SPA_ROUTE_PREFIXES = new Set([
  'admin',
  'ai-gym',
  'assinantes',
  'auth',
  'configuracoes',
  'crm',
  'dashboard',
  'fluxo-caixa',
  'historico',
  'mockup',
  'proposta',
  'proposta-definitiva',
  'proposta-inicial',
  'rag-dashboard',
  'self-improvement',
  'solicitar-contrato',
  'solicitar-proposta-definitiva',
  'template-editor',
  'treinamento',
  'usineiros',
  'whatsapp',
])

export function isSpaRoute(slug: string[] | undefined): boolean {
  return !!slug?.length && SPA_ROUTE_PREFIXES.has(slug[0])
}
