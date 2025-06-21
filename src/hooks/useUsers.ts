import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: string;
  department: string;
  is_admin: string; // String: '0' = master, '1' = usuário comum
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin, isMasterUser } = useAdminAuth();
  const { currentCompany } = useCompanies();
  const { userLogin } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users for company:', currentCompany);

      // Se não há empresa selecionada, não carregar usuários
      if (!currentCompany) {
        console.log('No company selected, clearing users');
        setUsers([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('users')
        .select('*');

      // Se for usuário master, pode ver todos os usuários da empresa selecionada
      // Se for usuário comum, só pode ver usuários da sua empresa
      if (currentCompany) {
        console.log('Filtering users for company:', currentCompany.id);
        
        const { data: companyUsers } = await supabase
          .from('user_companies')
          .select('user_id')
          .eq('company_id', currentCompany.id);
        
        if (companyUsers && companyUsers.length > 0) {
          const userIds = companyUsers.map(uc => uc.user_id);
          console.log('Found user IDs for company:', userIds);
          query = query.in('id', userIds);
        } else {
          console.log('No users found for company');
          setUsers([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Users fetched successfully:', data);
      
      const formattedUsers = (data || []).map(user => ({
        ...user,
        status: user.status as 'active' | 'inactive'
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
        is_admin: userData.is_admin || '1', // Default para usuário comum
        status: userData.status || 'active'
      };

      console.log('Inserting user data:', userToInsert);

      // Tentar inserção direta primeiro
      const { data, error } = await supabase
        .from('users')
        .insert([userToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating user:', error);
        
        if (error.code === '23505') {
          throw new Error('Email já está em uso por outro usuário');
        }
        
        // Se houver erro de RLS, tentar usar uma query mais específica
        if (error.code === '42501' || error.message.includes('row-level security')) {
          console.log('RLS error, this might be expected with the current policies');
          throw new Error('Erro de permissão. Verifique se você tem autorização para criar usuários.');
        }
        
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      console.log('User created successfully:', data);
      
      if (!data) {
        throw new Error('Erro: dados do usuário não retornados após criação');
      }
      
      const formattedUser: User = {
        ...data,
        status: data.status as 'active' | 'inactive'
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
      console.log('Updating user:', id, 'with data:', updates);

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

      // is_admin agora é string, não precisa de conversão boolean
      if (typeof updateData.is_admin !== 'undefined') {
        updateData.is_admin = String(updateData.is_admin);
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
      
      console.log('User updated successfully:', data);
      
      const formattedUser = {
        ...data,
        status: data.status as 'active' | 'inactive'
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
      console.log('Deleting user:', id);

      // Verificar se há associações do usuário com empresas
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('id')
        .eq('user_id', id)
        .limit(1);

      if (userCompanies && userCompanies.length > 0) {
        // Remover associações primeiro
        const { error: deleteAssociationsError } = await supabase
          .from('user_companies')
          .delete()
          .eq('user_id', id);

        if (deleteAssociationsError) {
          console.error('Error deleting user associations:', deleteAssociationsError);
          throw new Error('Erro ao remover associações do usuário');
        }
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      console.log('User deleted successfully:', id);
      
      setUsers(prev => prev.filter(user => user.id !== id));
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover usuário";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Effect principal que carrega usuários quando a empresa atual muda
  useEffect(() => {
    console.log('useUsers effect triggered - currentCompany changed:', currentCompany);
    fetchUsers();
  }, [currentCompany?.id]); // Dependência específica no ID da empresa

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
}
