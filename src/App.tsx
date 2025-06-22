
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Empresas from '@/pages/Empresas';
import Usuarios from '@/pages/Usuarios';
import Planos from '@/pages/Planos';
import SQLServer from '@/pages/SQLServer';
import Agendamentos from '@/pages/Agendamentos';
import WhatsApp from '@/pages/WhatsApp';
import Webhooks from '@/pages/Webhooks';
import Relatorios from '@/pages/Relatorios';
import ConfiguracaoSistema from '@/pages/ConfiguracaoSistema';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CompanyProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/empresas" element={<Empresas />} />
                          <Route path="/usuarios" element={<Usuarios />} />
                          <Route path="/planos" element={<Planos />} />
                          <Route path="/sql-server" element={<SQLServer />} />
                          <Route path="/agendamentos" element={<Agendamentos />} />
                          <Route path="/whatsapp" element={<WhatsApp />} />
                          <Route path="/webhooks" element={<Webhooks />} />
                          <Route path="/relatorios" element={<Relatorios />} />
                          <Route path="/configuracao-sistema" element={<ConfiguracaoSistema />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </CompanyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
