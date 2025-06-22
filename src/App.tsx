
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { CompaniesProvider } from '@/providers/CompaniesProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Empresas from '@/pages/Empresas';
import Usuarios from '@/pages/Usuarios';
import Planos from '@/pages/Planos';
import ConsultasSQL from '@/pages/ConsultasSQL';
import Agendamentos from '@/pages/Agendamentos';
import ConfiguracaoSistema from '@/pages/ConfiguracaoSistema';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CompaniesProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen bg-gray-100">
                        <Sidebar />
                        <main className="flex-1 overflow-auto p-6">
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/empresas" element={<Empresas />} />
                            <Route path="/usuarios" element={<Usuarios />} />
                            <Route path="/planos" element={<Planos />} />
                            <Route path="/consultas" element={<ConsultasSQL />} />
                            <Route path="/agendamento" element={<Agendamentos />} />
                            <Route path="/configuracao-sistema" element={<ConfiguracaoSistema />} />
                          </Routes>
                        </main>
                      </div>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </CompaniesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
