import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Mail, Lock, User, Package, Calendar, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSystemUpdates } from "@/hooks/useSystemUpdates";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, userLogin, loading, createMasterUser } = useAuth();
  const { toast } = useToast();
  const { updates, loading: updatesLoading } = useSystemUpdates();
  const { config: systemConfig } = useSystemConfig();

  const [loginForm, setLoginForm] = useState({
    email: "contato@parkersolucoes.com.br",
    password: "Parker@2024"
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [resetEmail, setResetEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    // Redirecionar usuários autenticados
    if ((user || userLogin) && !loading) {
      navigate('/dashboard');
    }
  }, [user, userLogin, loading, navigate]);

  // Criar usuário master automaticamente na inicialização
  useEffect(() => {
    const initializeMasterUser = async () => {
      try {
        console.log('Initializing master user...');
        await createMasterUser();
      } catch (error) {
        console.error('Error initializing master user:', error);
      }
    };
    
    initializeMasterUser();
  }, [createMasterUser]);

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
            case 'email_not_confirmed':
              errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
              break;
            case 'too_many_requests':
              errorMessage = "Muitas tentativas. Aguarde alguns minutos.";
              break;
            case 'signup_disabled':
              errorMessage = "Sistema de cadastro desabilitado.";
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (registerForm.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(registerForm.email, registerForm.password, registerForm.name);
      
      if (error) {
        let errorMessage = "Erro ao criar conta";
        
        if (error.message.includes('already registered')) {
          errorMessage = "Este email já está cadastrado";
        } else if (error.message.includes('weak password')) {
          errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres";
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar conta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Erro",
        description: "Digite seu email para recuperar a senha",
        variant: "destructive"
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao enviar email de recuperação",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Email de recuperação enviado! Verifique sua caixa de entrada.",
        });
        setResetEmail("");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar email de recuperação",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
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
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Registrar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
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
                    
                    {/* Seção de recuperação de senha */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="email"
                          placeholder="Email para recuperar senha"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePasswordReset}
                          disabled={isResettingPassword}
                        >
                          {isResettingPassword ? 'Enviando...' : 'Recuperar'}
                        </Button>
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
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Pelo menos 6 caracteres"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-confirm"
                          type="password"
                          placeholder="Repita sua senha"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
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
                      {isSubmitting ? 'Criando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
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
                        <Package className="w-3 h-3 mr-1" />
                        {update.version}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                    {update.description}
                  </p>
                  <div className="flex items-center text-xs text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(update.update_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">Nenhuma atualização disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
