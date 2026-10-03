"use client"

import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/ThemeProvider"
import Index from "@/screens/Index"

// Home renderizada no servidor (antes vinha do SPA com ssr:false e o HTML inicial
// chegava sem corpo — invisível para crawlers sem JS). Mesmos providers do App.tsx
// que a home usa; Router/Auth/React Query não são usados por ela.
export default function HomeClient() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Sonner />
        <Index />
      </TooltipProvider>
    </ThemeProvider>
  )
}
