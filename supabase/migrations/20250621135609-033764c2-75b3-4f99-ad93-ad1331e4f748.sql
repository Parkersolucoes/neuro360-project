
-- Criar tabela para planos
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_sql_connections INTEGER NOT NULL DEFAULT 1,
  max_sql_queries INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para assinaturas de usuários
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para transações financeiras
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir planos padrão
INSERT INTO public.plans (name, description, price, max_sql_connections, max_sql_queries) VALUES
('Básico', 'Plano básico para pequenas empresas', 29.90, 1, 10),
('Profissional', 'Plano profissional com mais recursos', 79.90, 5, 50),
('Empresarial', 'Plano empresarial com recursos ilimitados', 199.90, 20, 200);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plans (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Anyone can view plans" 
  ON public.plans 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Políticas RLS para user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_subscription_id ON public.transactions(subscription_id);

-- Adicionar constraint para garantir apenas uma assinatura ativa por usuário
CREATE UNIQUE INDEX idx_user_active_subscription ON public.user_subscriptions(user_id) 
WHERE status = 'active';
