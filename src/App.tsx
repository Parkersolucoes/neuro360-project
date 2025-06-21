
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Configuracao from "./pages/Configuracao";
import QRCodePage from "./pages/QRCode";
import ConsultasSQL from "./pages/ConsultasSQL";
import Templates from "./pages/Templates";
import Agendamento from "./pages/Agendamento";
import Usuarios from "./pages/Usuarios";
import Empresas from "./pages/Empresas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/configuracao" element={
            <DashboardLayout>
              <Configuracao />
            </DashboardLayout>
          } />
          <Route path="/qrcode" element={
            <DashboardLayout>
              <QRCodePage />
            </DashboardLayout>
          } />
          <Route path="/consultas" element={
            <DashboardLayout>
              <ConsultasSQL />
            </DashboardLayout>
          } />
          <Route path="/templates" element={
            <DashboardLayout>
              <Templates />
            </DashboardLayout>
          } />
          <Route path="/agendamento" element={
            <DashboardLayout>
              <Agendamento />
            </DashboardLayout>
          } />
          <Route path="/usuarios" element={
            <DashboardLayout>
              <Usuarios />
            </DashboardLayout>
          } />
          <Route path="/empresas" element={
            <DashboardLayout>
              <Empresas />
            </DashboardLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
