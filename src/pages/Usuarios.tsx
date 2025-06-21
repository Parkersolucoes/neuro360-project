
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users } from "lucide-react";
import { useUsers, User } from "@/hooks/useUsers";
import { useCompanies } from "@/hooks/useCompanies";
import { useUserCompanies } from "@/hooks/useUserCompanies";
import { UserDialog } from "@/components/usuarios/UserDialog";
import { UserTable } from "@/components/usuarios/UserTable";

export default function Usuarios() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const { companies } = useCompanies();
  const { createUserCompanies, getUserCompanies, getUserCompanyNames } = useUserCompanies();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [primaryCompany, setPrimaryCompany] = useState<string>('');

  const saveUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Saving user with companies:', { selectedCompanies, primaryCompany });
      
      let savedUser;
      if (editingUser) {
        savedUser = await updateUser(editingUser.id, userData);
        // Atualizar associações de empresas
        await createUserCompanies(editingUser.id, selectedCompanies, primaryCompany);
      } else {
        savedUser = await createUser(userData);
        // Criar associações de empresas
        if (selectedCompanies.length > 0) {
          await createUserCompanies(savedUser.id, selectedCompanies, primaryCompany);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const resetForm = () => {
    setSelectedCompanies([]);
    setPrimaryCompany('');
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const editUser = (user: User) => {
    console.log('Editing user:', user.id);
    setEditingUser(user);
    
    // Carregar empresas associadas ao usuário
    const userCompanies = getUserCompanies(user.id);
    console.log('User companies for editing:', userCompanies);
    const companyIds = userCompanies.map(uc => uc.company_id);
    const primary = userCompanies.find(uc => uc.is_primary)?.company_id || '';
    
    setSelectedCompanies(companyIds);
    setPrimaryCompany(primary);
    setIsDialogOpen(true);
  };

  const openNewUserDialog = () => {
    setEditingUser(null);
    setSelectedCompanies([]);
    setPrimaryCompany('');
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={openNewUserDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <UserDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingUser={editingUser}
        companies={companies}
        selectedCompanies={selectedCompanies}
        primaryCompany={primaryCompany}
        onSelectedCompaniesChange={setSelectedCompanies}
        onPrimaryCompanyChange={setPrimaryCompany}
        onSave={saveUser}
        onCancel={resetForm}
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
            getUserCompanyNames={getUserCompanyNames}
          />
        </CardContent>
      </Card>
    </div>
  );
}
