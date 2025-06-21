
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Rota pública para autenticação */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Redirecionar para auth se não autenticado */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
              
              {/* Rotas protegidas do dashboard */}
              <Route path="/*" element={
                <ProtectedRoute>
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
                </ProtectedRoute>
              } />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
