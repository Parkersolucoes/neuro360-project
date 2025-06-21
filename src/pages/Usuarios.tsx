
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useUsers, User } from "@/hooks/useUsers";
import { useCompanies } from "@/hooks/useCompanies";
import { useUserCompanies } from "@/hooks/useUserCompanies";
import { UserDialog } from "@/components/usuarios/UserDialog";
import { UserCompaniesDialog } from "@/components/usuarios/UserCompaniesDialog";
import { UserTable } from "@/components/usuarios/UserTable";

export default function Usuarios() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const { companies } = useCompanies();
  const { createUserCompanies, getUserCompanies, getUserCompanyNames } = useUserCompanies();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompaniesDialogOpen, setIsCompaniesDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [managingUser, setManagingUser] = useState<User | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [primaryCompany, setPrimaryCompany] = useState<string>('');

  const saveUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Saving user with data:', userData);
      
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const saveUserCompanies = async (userId: string, companies: string[], primaryCompany: string) => {
    try {
      await createUserCompanies(userId, companies, primaryCompany);
    } catch (error) {
      console.error('Error saving user companies:', error);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const resetCompaniesForm = () => {
    setSelectedCompanies([]);
    setPrimaryCompany('');
    setManagingUser(null);
    setIsCompaniesDialogOpen(false);
  };

  const editUser = (user: User) => {
    console.log('Editing user:', user.id);
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const manageUserCompanies = (user: User) => {
    console.log('Managing companies for user:', user.id);
    setManagingUser(user);
    
    // Carregar empresas associadas ao usuário
    const userCompanies = getUserCompanies(user.id);
    console.log('User companies for managing:', userCompanies);
    const companyIds = userCompanies.map(uc => uc.company_id);
    const primary = userCompanies.find(uc => uc.is_primary)?.company_id || '';
    
    setSelectedCompanies(companyIds);
    setPrimaryCompany(primary);
    setIsCompaniesDialogOpen(true);
  };

  const openNewUserDialog = () => {
    console.log('Opening new user dialog');
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-2">Gerencie os usuários do sistema</p>
        </div>
        <Button 
          onClick={openNewUserDialog}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <UserDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingUser={editingUser}
        onSave={saveUser}
        onCancel={resetForm}
      />

      <UserCompaniesDialog
        isOpen={isCompaniesDialogOpen}
        onOpenChange={setIsCompaniesDialogOpen}
        user={managingUser}
        companies={companies}
        selectedCompanies={selectedCompanies}
        primaryCompany={primaryCompany}
        onSelectedCompaniesChange={setSelectedCompanies}
        onPrimaryCompanyChange={setPrimaryCompany}
        onSave={saveUserCompanies}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Lista de Usuários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            onEditUser={editUser}
            onDeleteUser={deleteUser}
            onManageCompanies={manageUserCompanies}
            getUserCompanyNames={getUserCompanyNames}
          />
        </CardContent>
      </Card>
    </div>
  );
}
