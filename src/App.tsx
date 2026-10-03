import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./screens/Index";
import Auth from "./screens/Auth";
import PropostaPublica from "./screens/PropostaPublica";
import SolicitarPropostaDefinitiva from "./screens/SolicitarPropostaDefinitiva";
import NotFound from "./screens/NotFound";

// 03/10/2026: removidas as telas internas herdadas do Lovable (CRM, AI Gym, dashboards,
// admin, mockups). Liam o projeto Supabase original, inacessível desde 24/08/2026, e
// nenhuma Edge Function está publicada no projeto atual — ficavam vazias ou quebradas.
const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/proposta/:id" element={<PropostaPublica />} />
      <Route path="/solicitar-contrato/:id" element={<SolicitarPropostaDefinitiva />} />
      {/* Retrocompatibilidade URLs antigas */}
      <Route path="/proposta-inicial/:id" element={<PropostaPublica />} />
      <Route path="/proposta-definitiva/:id" element={<PropostaPublica />} />
      <Route path="/solicitar-proposta-definitiva/:id" element={<SolicitarPropostaDefinitiva />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
