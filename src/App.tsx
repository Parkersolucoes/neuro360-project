
import { Routes, Route, Navigate } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompaniesProvider } from "@/providers/CompaniesProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Empresas from "@/pages/Empresas";
import Usuarios from "@/pages/Usuarios";
import ConsultasSQL from "@/pages/ConsultasSQL";
import SQLServer from "@/pages/SQLServer";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Relatorios from "@/pages/Relatorios";
import Planos from "@/pages/Planos";
import Financeiro from "@/pages/Financeiro";
import Webhooks from "@/pages/Webhooks";
import Configuracao from "@/pages/Configuracao";
import ConfiguracaoSistema from "@/pages/ConfiguracaoSistema";
import Agendamentos from "@/pages/Agendamentos";
import Agendamento from "@/pages/Agendamento";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompaniesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/empresas" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Empresas />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/usuarios" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Usuarios />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/consultas-sql" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ConsultasSQL />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/sql-server" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SQLServer />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Relatorios />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/planos" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Planos />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/financeiro" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Financeiro />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/webhooks" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Webhooks />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/configuracao" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Configuracao />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/configuracao-sistema" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ConfiguracaoSistema />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agendamentos" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Agendamentos />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agendamento/:id?" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Agendamento />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CompaniesProvider>
    </QueryClientProvider>
  );
}

export default App;
