
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useSystemUpdates } from '@/hooks/useSystemUpdates';
import { Database, BarChart3, TrendingUp, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Auth() {
  const { userLogin, login } = useAuth();
  const { config } = useSystemConfig();
  const { updates, loading: updatesLoading } = useSystemUpdates();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Se já está logado, redirecionar para dashboard
  if (userLogin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Erro de autenticação');
      }
    } catch (err) {
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Painel de Login - Lado Esquerdo */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 p-8 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-xl">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-white leading-tight text-center">
                {config?.system_name || 'Visão 360'}
                <span className="block text-[#FFD700] text-2xl font-normal mt-2">
                  Soluções em Dados
                </span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed text-center">
                {config?.system_description || 'Plataforma completa para análise e gestão de dados empresariais com tecnologia avançada'}
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/20 to-[#FFD700]/20 backdrop-blur-sm rounded-xl border border-[#FFD700]/20">
                <div className="p-2 bg-[#FFD700]/20 rounded-lg">
                  <Database className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Consultas SQL Avançadas</h3>
                  <p className="text-gray-400 text-xs">Execute consultas complexas com facilidade</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/20 to-[#FFD700]/20 backdrop-blur-sm rounded-xl border border-[#FFD700]/20">
                <div className="p-2 bg-[#FFD700]/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Análise de Dados</h3>
                  <p className="text-gray-400 text-xs">Insights poderosos para seu negócio</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/20 to-[#FFD700]/20 backdrop-blur-sm rounded-xl border border-[#FFD700]/20">
                <div className="p-2 bg-[#FFD700]/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Gestão Inteligente</h3>
                  <p className="text-gray-400 text-xs">Automatize processos e otimize resultados</p>
                </div>
              </div>
            </div>

            {/* Seção de Login */}
            <div className="mt-6 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                Faça login para acessar sua plataforma
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 h-11"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    'Entrar na Plataforma'
                  )}
                </Button>
              </form>
            </div>

            {/* Dados para teste */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-blue-300 font-medium mb-1">Dados para teste:</p>
              <div className="space-y-1 text-xs text-gray-300">
                <p><span className="text-[#FFD700]">Email:</span> admin@visao360.com.br</p>
                <p><span className="text-[#FFD700]">Senha:</span> 123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Área das Atualizações do Sistema - Lado Direito */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-yellow-400/3 rounded-full blur-2xl"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
        
        <div className="relative z-10 h-full flex flex-col p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-2xl mr-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-4xl font-bold text-yellow-400 tracking-tight">
                Atualizações do Sistema
              </h2>
            </div>
            <p className="text-xl text-yellow-200/80 font-light">
              Acompanhe as últimas melhorias e novidades da plataforma
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 max-h-[calc(100vh-250px)] pr-2">
            {updatesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400/30 border-t-yellow-400"></div>
                  <span className="text-yellow-300 font-medium">Carregando atualizações...</span>
                </div>
              </div>
            ) : updates.length > 0 ? (
              updates.map((update, index) => (
                <Card key={update.id} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 shadow-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-bold text-yellow-400 flex items-center space-x-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-yellow-400" />
                        </div>
                        <span className="leading-tight">{update.title}</span>
                      </CardTitle>
                      {update.version && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-semibold px-3 py-1">
                          {update.version}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-100/90 mb-4 leading-relaxed text-lg">
                      {update.description}
                    </p>
                    <div className="flex items-center text-yellow-300/80 bg-slate-900/50 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        {format(new Date(update.update_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-yellow-400/60" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                  Nenhuma atualização disponível
                </h3>
                <p className="text-yellow-200/70 text-lg">
                  As atualizações do sistema aparecerão aqui quando disponíveis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
