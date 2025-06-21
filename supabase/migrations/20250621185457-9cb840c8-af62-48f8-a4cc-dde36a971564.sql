
-- Deletar todos os usuários existentes
DELETE FROM public.users;

-- Criar um único usuário master
INSERT INTO public.users (
  name,
  email,
  phone,
  whatsapp,
  role,
  department,
  is_admin,
  is_master,
  status
) VALUES (
  'Master User - Parker Soluções',
  'contato@parkersolucoes.com.br',
  '(11) 99999-9999',
  '5511999999999',
  'master',
  'Administração',
  true,
  true,
  'active'
);
