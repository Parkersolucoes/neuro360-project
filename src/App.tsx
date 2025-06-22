
import { Routes, Route, Navigate } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompaniesProvider } from "@/providers/CompaniesProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import WhatsApp from "@/pages/WhatsApp";

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
      <AuthProvider>
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
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/empresas" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Empresas />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/usuarios" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Usuarios />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/consultas-sql" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <ConsultasSQL />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/sql-server" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <SQLServer />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/whatsapp" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <WhatsApp />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Relatorios />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/planos" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Planos />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/financeiro" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Financeiro />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/webhooks" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Webhooks />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/configuracao" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Configuracao />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/configuracao-sistema" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <ConfiguracaoSistema />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/agendamentos" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Agendamentos />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/agendamento/:id?" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <Agendamento />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CompaniesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
