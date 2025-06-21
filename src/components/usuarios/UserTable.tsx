
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Phone, Mail, Shield, MessageSquare, Building2 } from "lucide-react";
import { User } from "@/hooks/useUsers";

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onManageCompanies: (user: User) => void;
  getUserCompanyNames: (userId: string) => string;
}

export function UserTable({ 
  users, 
  onEditUser, 
  onDeleteUser, 
  onManageCompanies,
  getUserCompanyNames 
}: UserTableProps) {
  const roles = [
    { value: "admin", label: "Administrador" },
    { value: "manager", label: "Gerente" },
    { value: "user", label: "Usuário" }
  ];

  const getRoleLabel = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await onDeleteUser(userId);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Empresas Vinculadas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div>
                  <div className="font-medium flex items-center space-x-2">
                    <span>{user.name}</span>
                    {user.is_admin && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Criado em {new Date(user.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-3 h-3 text-green-500" />
                  <span className="text-sm">{user.whatsapp}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {getRoleLabel(user.role)}
              </Badge>
            </TableCell>
            <TableCell>{user.department}</TableCell>
            <TableCell>
              <div className="text-sm max-w-48">
                {getUserCompanyNames(user.id)}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={
                user.status === "active" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              }>
                {user.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onManageCompanies(user)}
                  title="Gerenciar Empresas"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Building2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditUser(user)}
                  title="Editar"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteUser(user.id)}
                  title="Excluir"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
