// REGRESSÃO 02/10/2026 — auditoria SEO/performance: 4 imagens de seção da home vinham
// do Unsplash em w=2000 (até 1,1 MB), sem lazy, todas na abertura (LCP mobile 7,6 s).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { responsiveImageProps } from './responsive-image'

const UNSPLASH = 'https://images.unsplash.com/photo-1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'

describe('REGRESSÃO: imagens responsivas da home', () => {
  it('gera srcSet com larguras menores mantendo os demais parâmetros', () => {
    const p = responsiveImageProps(UNSPLASH)
    expect(p.srcSet).toContain('w=640&q=80 640w')
    expect(p.srcSet).toContain('auto=format')
    expect(p.sizes).toBe('100vw')
  })

  it('URL fora do Unsplash ou inválida passa intacta', () => {
    expect(responsiveImageProps('/media/x.png')).toEqual({ src: '/media/x.png' })
    expect(responsiveImageProps('https://cdn.exemplo.com/a.jpg')).toEqual({ src: 'https://cdn.exemplo.com/a.jpg' })
  })

  it.each(['CTASection', 'HowItWorksSection', 'WhyChooseSection', 'AboutSection'])('%s usa lazy + srcSet', name => {
    const src = readFileSync(join(__dirname, '../components/home', `${name}.tsx`), 'utf-8')
    expect(src).toMatch(/responsiveImageProps\(configs\.home_bg_/)
    expect(src).toMatch(/loading="lazy"/)
  })
})
