import { Toaster as Sonner } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ThemeProvider"
import { LazyMotion } from "framer-motion"
import Index from "@/screens/Index"
import type { BlogArticle } from "@/components/blog/HomeBlogSection"

const loadFeatures = () => import("@/components/home/motion-features").then(({ default: features }) => features)

// Home renderizada no servidor (antes vinha do SPA com ssr:false e o HTML inicial
// chegava sem corpo — invisível para crawlers sem JS). Mesmos providers do App.tsx
// que a home usa; Router/Auth/React Query não são usados por ela.
export default function HomeClient({ latestArticles }: { latestArticles?: BlogArticle[] }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Sonner />
      <LazyMotion features={loadFeatures}>
        <Index latestArticles={latestArticles} />
      </LazyMotion>
    </ThemeProvider>
  )
}
