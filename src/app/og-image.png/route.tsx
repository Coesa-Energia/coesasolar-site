import { ImageResponse } from "next/og"
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount"

// /og-image.png era referenciado pelo layout (OpenGraph/Twitter), /investimentos e o
// JSON-LD, mas o arquivo nunca existiu (404 em produção — auditoria SEO 03/10/2026).
// Gerado por código nas cores do design system Coesa; cacheado como estático.
export const dynamic = "force-static"

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#064A36",
          padding: "72px 80px",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#9BC53D" }}>COESA ENERGIA INTELIGENTE</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.08, fontFamily: "serif" }}>Energia solar por assinatura</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 36, color: "#F3F0E7" }}>
            {`${PUBLIC_DISCOUNT_LABEL} de desconto na conta de luz, sem investimento e sem obras`}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#F3F0E7" }}>coesasolar.com.br</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
