
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Usuarios from "./pages/Usuarios";
import Templates from "./pages/Templates";
import ConsultasSQL from "./pages/ConsultasSQL";
import Agendamento from "./pages/Agendamento";
import QRCode from "./pages/QRCode";
import Configuracao from "./pages/Configuracao";
import ConfiguracaoSistema from "./pages/ConfiguracaoSistema";
import Planos from "./pages/Planos";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/*" element={
              <DashboardLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/empresas" element={<Empresas />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/consultas" element={<ConsultasSQL />} />
                  <Route path="/agendamento" element={<Agendamento />} />
                  <Route path="/qrcode" element={<QRCode />} />
                  <Route path="/configuracao" element={<Configuracao />} />
                  <Route path="/configuracao-sistema" element={<ConfiguracaoSistema />} />
                  <Route path="/planos" element={<Planos />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DashboardLayout>
            } />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
