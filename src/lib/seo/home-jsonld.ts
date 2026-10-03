import { AUTOBLOG_PROFILE } from '@/lib/autoblog-profile'
import { PUBLIC_DISCOUNT_LABEL } from '@/lib/public-discount'
import { COESA_COMPANY } from '@/lib/coesa-company'

const SITE_URL = AUTOBLOG_PROFILE.brand.siteUrl
export const ORGANIZATION_ID = `${SITE_URL}/#organization`

// Só dados verificados (src/lib/coesa-company.ts) — nunca os defaults antigos de
// useConfiguracoes, que eram placeholders.
export function buildHomeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: COESA_COMPANY.name,
        legalName: COESA_COMPANY.legalName,
        alternateName: [AUTOBLOG_PROFILE.brand.name, 'Coesa Energia'],
        taxID: COESA_COMPANY.cnpj,
        foundingDate: COESA_COMPANY.foundingYear,
        url: SITE_URL,
        logo: AUTOBLOG_PROFILE.brand.logoUrl,
        email: COESA_COMPANY.email,
        telephone: `+${COESA_COMPANY.whatsapp}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: COESA_COMPANY.address.street,
          addressLocality: COESA_COMPANY.address.city,
          addressRegion: COESA_COMPANY.address.state,
          postalCode: COESA_COMPANY.address.postalCode,
          addressCountry: 'BR',
        },
        areaServed: { '@type': 'State', name: 'Minas Gerais', addressCountry: 'BR' },
        sameAs: [
          COESA_COMPANY.site,
          COESA_COMPANY.instagram,
          COESA_COMPANY.linkedin,
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
