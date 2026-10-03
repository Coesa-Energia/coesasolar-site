import { AUTOBLOG_PROFILE } from '@/lib/autoblog-profile'
import { PUBLIC_DISCOUNT_LABEL } from '@/lib/public-discount'

const SITE_URL = AUTOBLOG_PROFILE.brand.siteUrl
export const ORGANIZATION_ID = `${SITE_URL}/#organization`

// Só dados verificados: nome legal e marca, domínio institucional e perfil Reclame Aqui
// linkado no rodapé. Redes sociais/CNPJ/endereço entram quando o dono confirmar
// (os defaults de useConfiguracoes são placeholders e não podem virar schema).
export function buildHomeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'COESA Energia Inteligente',
        alternateName: [AUTOBLOG_PROFILE.brand.name, 'Coesa Energia'],
        url: SITE_URL,
        logo: AUTOBLOG_PROFILE.brand.logoUrl,
        email: 'contato@coesaenergia.com.br',
        areaServed: { '@type': 'State', name: 'Minas Gerais', addressCountry: 'BR' },
        sameAs: [
          'https://coesaenergia.com.br',
          'https://www.reclameaqui.com.br/empresa/coesa-energia-inteligente/',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: AUTOBLOG_PROFILE.brand.name,
        inLanguage: 'pt-BR',
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/#servico-energia-solar-assinatura`,
        name: 'Energia solar por assinatura',
        serviceType: 'Geração distribuída compartilhada',
        description: `Desconto de ${PUBLIC_DISCOUNT_LABEL} na conta de luz com energia de usinas solares, sem investimento inicial, sem obras e com contratação 100% digital.`,
        provider: { '@id': ORGANIZATION_ID },
        areaServed: { '@type': 'State', name: 'Minas Gerais', addressCountry: 'BR' },
        url: SITE_URL,
      },
    ],
  }
}
