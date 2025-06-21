
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Verificar se é usuário master ou admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, is_master_user')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setIsAdmin(false);
      } else {
        // Se é master user ou admin, ou tem entrada na tabela admin_users
        const isMasterOrAdmin = profile?.is_master_user || profile?.is_admin;
        
        if (!isMasterOrAdmin) {
          // Verificar na tabela admin_users
          const { data, error } = await supabase.rpc('is_admin_user');
          if (error) throw error;
          setIsAdmin(data || false);
        } else {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async (masterPassword: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verificar se já é usuário master
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_master_user')
        .eq('id', user.id)
        .single();

      if (profile?.is_master_user) {
        await checkAdminStatus();
        toast({
          title: "Sucesso",
          description: "Você já é um usuário master!"
        });
        return true;
      }

      // Para usuários não-master, usar a senha admin temporária
      if (masterPassword === 'admin123') {
        const { error } = await supabase
          .from('admin_users')
          .upsert({
            user_id: user.id,
            master_password_hash: 'hashed_password',
            is_active: true
          });

        if (error) throw error;
        
        await checkAdminStatus();
        toast({
          title: "Sucesso",
          description: "Acesso de administrador concedido!"
        });
        return true;
      } else {
        toast({
          title: "Erro",
          description: "Senha master incorreta",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error logging in as admin:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer login como administrador",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return {
    isAdmin,
    loading,
    loginAsAdmin,
    checkAdminStatus
  };
}
