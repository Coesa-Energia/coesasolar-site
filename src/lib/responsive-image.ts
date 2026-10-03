// Imagens de fundo da home vêm do Unsplash em w=2000 (até 1,1 MB cada) e carregavam
// todas na abertura. O CDN do Unsplash redimensiona pelo parâmetro `w`: daqui sai o
// srcSet para o navegador baixar só a largura que a tela precisa.
const WIDTHS = [640, 1080, 1600, 2000]

export function responsiveImageProps(src: string, sizes = '100vw'): { src: string; srcSet?: string; sizes?: string } {
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return { src }
  }
  if (url.hostname !== 'images.unsplash.com') return { src }
  const srcSet = WIDTHS.map(w => {
    url.searchParams.set('w', String(w))
    return `${url.toString()} ${w}w`
  }).join(', ')
  return { src, srcSet, sizes }
}
