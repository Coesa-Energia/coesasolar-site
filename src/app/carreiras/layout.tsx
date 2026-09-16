import Script from "next/script"
import { UtmCatcher } from "@/components/carreiras/UtmCatcher"

// GTM exclusivo da área de vagas (carreiras + detalhes de vaga) — não deve rodar no resto do site.
const CAREERS_GTM_ID = "GTM-NSPWK2FM"

export default function CarreirasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="careers-gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${CAREERS_GTM_ID}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${CAREERS_GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <UtmCatcher />
      {children}
    </>
  )
}
