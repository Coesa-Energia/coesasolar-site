// Dados públicos e verificados da empresa (fonte única para rodapé, JSON-LD e PDFs).
// CNPJ/endereço confirmados pelo dono em 10/08/2026 e exibidos em coesaenergia.com.br;
// WhatsApp = número dos CTAs do site; redes = perfis oficiais (@coesaenergia, LinkedIn).
// A tabela configuracoes_sistema do projeto Supabase original está inacessível, então
// estes valores substituem os placeholders (CNPJ 00.000.000/0001-00, Av. Paulista...).
export const COESA_COMPANY = {
  name: 'COESA Energia Inteligente',
  legalName: 'COESA ENERGIA LTDA',
  cnpj: '60.937.217/0001-54',
  foundingYear: '2018',
  email: 'contato@coesaenergia.com.br',
  whatsapp: '5531936185192',
  phoneDisplay: '(31) 93618-5192',
  address: {
    street: 'Rua Desembargador Edésio Fernandes, 148, 2º andar',
    neighborhood: 'Estoril',
    city: 'Belo Horizonte',
    state: 'MG',
    postalCode: '30494-450',
  },
  instagram: 'https://www.instagram.com/coesaenergia/',
  linkedin: 'https://www.linkedin.com/company/coesa-energia/',
  facebook: 'https://www.facebook.com/coesaenergia',
  site: 'https://coesaenergia.com.br',
} as const

export const COESA_ADDRESS_LINE = `${COESA_COMPANY.address.street} - ${COESA_COMPANY.address.neighborhood}, ${COESA_COMPANY.address.city} - ${COESA_COMPANY.address.state}, ${COESA_COMPANY.address.postalCode}`
