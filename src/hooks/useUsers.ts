
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCompanies } from '@/hooks/useCompanies';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: string;
  department: string;
  is_admin: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();
  const { currentCompany } = useCompanies();

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('users')
        .select('*');

      // Se não for admin, filtrar apenas usuários das empresas do usuário logado
      if (!isAdmin && currentCompany) {
        const { data: companyUsers } = await supabase
          .from('user_companies')
          .select('user_id')
          .eq('company_id', currentCompany.id);
        
        if (companyUsers && companyUsers.length > 0) {
          const userIds = companyUsers.map(uc => uc.user_id);
          query = query.in('id', userIds);
        } else {
          setUsers([]);
          setLoading(false);
          return;
        }
      }

      // Se há uma empresa selecionada, filtrar usuários dessa empresa
      if (currentCompany) {
        const { data: companyUsers } = await supabase
          .from('user_companies')
          .select('user_id')
          .eq('company_id', currentCompany.id);
        
        if (companyUsers && companyUsers.length > 0) {
          const userIds = companyUsers.map(uc => uc.user_id);
          query = query.in('id', userIds);
        } else {
          setUsers([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      
      setUsers(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setUsers(prev => prev.map(user => 
        user.id === id ? data : user
      ));
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setUsers(prev => prev.filter(user => user.id !== id));
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin, currentCompany]);

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
}
