
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSystemUpdates } from "@/hooks/useSystemUpdates";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, userLogin, loading } = useAuth();
  const { toast } = useToast();
  const { updates, loading: updatesLoading } = useSystemUpdates();
  const { config: systemConfig } = useSystemConfig();

  const [loginForm, setLoginForm] = useState({
    email: "contato@parkersolucoes.com.br",
    password: "Parker@2024"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirecionar usuários autenticados
    if (userLogin && !loading) {
      navigate('/dashboard');
    }
  }, [userLogin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== INICIANDO TENTATIVA DE LOGIN ===');
    console.log('Form data:', { email: loginForm.email, passwordLength: loginForm.password.length });
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Erro de Validação",
        description: "Email e senha são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Chamando função signIn...');
      const { error } = await signIn(loginForm.email.trim(), loginForm.password);
      
      console.log('Resultado do signIn:', { error });
      
      if (error) {
        console.error('Erro detalhado do login:', error);
        
        let errorMessage = "Erro ao fazer login";
        
        // Usar a mensagem personalizada se disponível
        if (error.userMessage) {
          errorMessage = error.userMessage;
        } else {
          // Fallback para mensagens baseadas no código
          switch (error.code) {
            case 'invalid_credentials':
              errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
              break;
            default:
              errorMessage = `Erro: ${error.message || 'Erro desconhecido'}`;
          }
        }
        
        toast({
          title: "Erro no Login",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('Login realizado com sucesso!');
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro inesperado no handleLogin:', error);
      toast({
        title: "Erro Inesperado",
        description: `Erro inesperado: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const testMasterLogin = async () => {
    console.log('=== TESTE DE LOGIN MASTER ===');
    console.log('Timestamp:', new Date().toISOString());
    
    setIsSubmitting(true);
    
    try {
      console.log('Iniciando teste de login master...');
      const { error } = await signIn("contato@parkersolucoes.com.br", "Parker@2024");
      
      console.log('Resultado do teste:', { error });
      
      if (error) {
        console.error('Teste falhou:', error);
        toast({
          title: "Teste Falhou",
          description: `Erro: ${error.userMessage || error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Teste bem-sucedido!');
        toast({
          title: "Teste Bem-sucedido",
          description: "Login do usuário master funcionou!",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro no teste:', error);
      toast({
        title: "Erro no Teste",
        description: `Erro inesperado: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  const systemName = "Visão 360 - Soluções em Dados";
  const systemDescription = systemConfig?.system_description || "Soluções de Análise dados para seu negócio";
  const backgroundImage = systemConfig?.login_background_image;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Painel esquerdo - Login */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {systemName}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {systemDescription}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Informações do usuário master */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Usuário Master</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Email:</strong> contato@parkersolucoes.com.br</p>
                  <p><strong>Senha:</strong> Parker@2024</p>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={testMasterLogin}
                    disabled={isSubmitting}
                    className="mt-2 text-xs"
                  >
                    {isSubmitting ? 'Testando...' : 'Testar Login Master'}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-slate-800 hover:bg-slate-900"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Painel direito - Atualizações com imagem de fundo personalizada */}
      <div 
        className="hidden lg:block lg:w-96 bg-slate-800 text-white relative overflow-hidden"
        style={backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.85), rgba(30, 41, 59, 0.85)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        <div className="p-8 h-full overflow-y-auto relative z-10">
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Atualizações Recentes</h3>
            <p className="text-slate-300 text-sm">
              Confira as últimas melhorias e novidades da plataforma
            </p>
          </div>

          {updatesLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : updates.length > 0 ? (
            <div className="space-y-6">
              {updates.map((update) => (
                <div key={update.id} className="border-b border-slate-700 pb-6 last:border-b-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <h4 className="font-semibold text-white">{update.title}</h4>
                    {update.version && (
                      <Badge variant="outline" className="text-xs bg-slate-700 border-slate-600 text-slate-200">
                        {update.version}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                    {update.description}
                  </p>
                  <div className="flex items-center text-xs text-slate-400">
                    <span>{format(new Date(update.update_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-300">Nenhuma atualização disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
