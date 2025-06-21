
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

      const { data, error } = await supabase.rpc('is_admin_user');
      
      if (error) throw error;
      
      setIsAdmin(data || false);
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

      // Para simplificar, vamos usar uma senha fixa temporariamente
      // Em produção, isso deveria ser criptografado e verificado adequadamente
      if (masterPassword === 'admin123') {
        const { error } = await supabase
          .from('admin_users')
          .upsert({
            user_id: user.id,
            master_password_hash: 'hashed_password', // Em produção, usar hash real
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
