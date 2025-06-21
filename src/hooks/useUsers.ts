
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
  is_master: boolean;
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
      
      const formattedUsers = (data || []).map(user => ({
        ...user,
        status: user.status as 'active' | 'inactive',
        is_master: Boolean(user.is_master)
      }));
      
      setUsers(formattedUsers);
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
      console.log('Creating user with data:', userData);
      
      // Validações básicas
      if (!userData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!userData.email?.trim()) {
        throw new Error('Email é obrigatório');
      }
      
      if (!userData.phone?.trim()) {
        throw new Error('Telefone é obrigatório');
      }
      
      if (!userData.whatsapp?.trim()) {
        throw new Error('WhatsApp é obrigatório');
      }
      
      if (!userData.department?.trim()) {
        throw new Error('Departamento é obrigatório');
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Formato de email inválido');
      }

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        throw new Error('Já existe um usuário com este email');
      }

      // Preparar dados para inserção
      const userToInsert = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        phone: userData.phone.trim(),
        whatsapp: userData.whatsapp.trim(),
        role: userData.role || 'user',
        department: userData.department.trim(),
        is_admin: Boolean(userData.is_admin),
        is_master: Boolean(userData.is_master),
        status: userData.status || 'active'
      };

      console.log('Inserting user data:', userToInsert);

      const { data, error } = await supabase
        .from('users')
        .insert([userToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        
        // Tratar erros específicos do Supabase
        if (error.code === '23505') {
          throw new Error('Email já está em uso por outro usuário');
        }
        
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      console.log('User created successfully:', data);
      
      const formattedUser = {
        ...data,
        status: data.status as 'active' | 'inactive',
        is_master: Boolean(data.is_master)
      };
      
      setUsers(prev => [formattedUser, ...prev]);
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!"
      });
      
      return formattedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar usuário";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      // Validações básicas para atualização
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('Formato de email inválido');
        }

        // Verificar se email já existe em outro usuário
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', updates.email.toLowerCase())
          .neq('id', id)
          .maybeSingle();

        if (existingUser) {
          throw new Error('Já existe outro usuário com este email');
        }
      }

      // Preparar dados para atualização
      const updateData: any = { ...updates };
      
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }
      
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }
      
      if (updateData.phone) {
        updateData.phone = updateData.phone.trim();
      }
      
      if (updateData.whatsapp) {
        updateData.whatsapp = updateData.whatsapp.trim();
      }
      
      if (updateData.department) {
        updateData.department = updateData.department.trim();
      }

      if (typeof updateData.is_admin !== 'undefined') {
        updateData.is_admin = Boolean(updateData.is_admin);
      }

      if (typeof updateData.is_master !== 'undefined') {
        updateData.is_master = Boolean(updateData.is_master);
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        
        if (error.code === '23505') {
          throw new Error('Email já está em uso por outro usuário');
        }
        
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      const formattedUser = {
        ...data,
        status: data.status as 'active' | 'inactive',
        is_master: Boolean(data.is_master)
      };
      
      setUsers(prev => prev.map(user => 
        user.id === id ? formattedUser : user
      ));
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!"
      });
      
      return formattedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar usuário";
      
      toast({
        title: "Erro",
        description: errorMessage,
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
