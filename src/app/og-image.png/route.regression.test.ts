// REGRESSÃO 03/10/2026 — /og-image.png referenciado em todo o site dava 404.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

describe("REGRESSÃO: imagem OpenGraph existe", () => {
  it("rota /og-image.png gera ImageResponse 1200x630 estática", () => {
    const src = readFileSync(join(__dirname, "route.tsx"), "utf-8")
    expect(src).toMatch(/export function GET/)
    expect(src).toMatch(/new ImageResponse/)
    expect(src).toMatch(/width: 1200, height: 630/)
    expect(src).toMatch(/force-static/)
  })

  it("o layout continua apontando para /og-image.png", () => {
    const layout = readFileSync(join(__dirname, "..", "layout.tsx"), "utf-8")
    expect(layout).toContain("https://coesasolar.com.br/og-image.png")
  })
})
