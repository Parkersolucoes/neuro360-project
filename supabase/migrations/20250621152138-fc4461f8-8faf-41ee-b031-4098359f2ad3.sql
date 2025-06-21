
-- Inserir usuário master na tabela users do sistema
INSERT INTO public.users (
  name,
  email,
  phone,
  whatsapp,
  role,
  department,
  is_admin,
  status
) VALUES (
  'Master User - Parker Soluções',
  'contato@parkersolucoes.com.br',
  '(11) 99999-9999',
  '5511999999999',
  'admin',
  'Administração',
  true,
  'active'
);

-- Verificar se o usuário foi criado
SELECT * FROM public.users WHERE email = 'contato@parkersolucoes.com.br';
