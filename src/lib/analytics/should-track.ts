// GA4 só no deploy de produção: localhost, 127.0.0.1 e Previews da Vercel estavam
// enviando sessões para a propriedade real (auditoria SEO 02/10/2026).
export function shouldLoadAnalytics(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV === 'production'
}
