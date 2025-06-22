
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { Database, BarChart3, TrendingUp } from 'lucide-react';

export default function Auth() {
  const { userLogin, login } = useAuth();
  const { config } = useSystemConfig();
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

  // Verificar se há imagem de fundo configurada
  const hasBackgroundImage = config?.login_background_image && config.login_background_image.trim() !== '';

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

      {/* Área da Imagem de Fundo - Lado Direito */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
        {hasBackgroundImage ? (
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${config.login_background_image})`
            }}
          >
            {/* Overlay sutil para melhor contraste */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Database className="w-16 h-16 text-white/80" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Bem-vindo ao {config?.system_name || 'Visão 360'}</h3>
              <p className="text-lg text-white/80 max-w-md mx-auto">
                Configure uma imagem de fundo personalizada nas configurações do sistema
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
