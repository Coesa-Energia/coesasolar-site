import { describe, expect, it } from "vitest"
import { formatarValor, lerValorIndicado } from "./beneficio"

describe("beneficio da indicação", () => {
  it("formata sem centavos quando redondo e com centavos quando não", () => {
    expect(formatarValor(50)).toBe("R$ 50")
    expect(formatarValor(37.5)).toBe("R$ 37,50")
  })

  it("só aceita número positivo", () => {
    expect(lerValorIndicado(50)).toBe(50)
    for (const v of [undefined, null, "50", 0, -5, NaN, Infinity]) expect(lerValorIndicado(v)).toBeNull()
  })
})
