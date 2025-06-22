
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CompaniesProvider } from "@/providers/CompaniesProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import QRCode from "./pages/QRCode";
import SQLServer from "./pages/SQLServer";
import ConsultasSQL from "./pages/ConsultasSQL";
import Agendamento from "./pages/Agendamento";
import Agendamentos from "./pages/Agendamentos";
import WhatsApp from "./pages/WhatsApp";
import Webhooks from "./pages/Webhooks";
import Relatorios from "./pages/Relatorios";
import Usuarios from "./pages/Usuarios";
import Empresas from "./pages/Empresas";
import Planos from "./pages/Planos";
import Financeiro from "./pages/Financeiro";
import Configuracao from "./pages/Configuracao";
import ConfiguracaoSistema from "./pages/ConfiguracaoSistema";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CompaniesProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/qrcode" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <QRCode />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/consultas" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SQLServer />
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
              
              <Route path="/templates" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-6">
                      <h1 className="text-3xl font-bold">Templates</h1>
                      <p className="text-gray-600 mt-2">Funcionalidade em desenvolvimento</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/agendamento" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Agendamento />
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
              
              <Route path="/whatsapp" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <WhatsApp />
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
              
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Relatorios />
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
              
              <Route path="/empresas" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Empresas />
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
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CompaniesProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
