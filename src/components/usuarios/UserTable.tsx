
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Building2, Key } from "lucide-react";
import { User } from "@/hooks/useUsers";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onManageCompanies: (user: User) => void;
  onGeneratePassword: (user: User) => void;
  getUserCompanyNames: (userId: string) => string;
}

export function UserTable({ 
  users, 
  onEditUser, 
  onDeleteUser, 
  onManageCompanies,
  onGeneratePassword,
  getUserCompanyNames 
}: UserTableProps) {
  const { isMasterUser } = useAdminAuth();

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await onDeleteUser(userId);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Empresas</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.whatsapp}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <span className="text-sm text-gray-600">
                    {getUserCompanyNames(user.id) || "Nenhuma empresa"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  className={user.is_admin === '0' ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}
                >
                  {user.is_admin === '0' ? "Master" : "Usuário"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  className={user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {user.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditUser(user)}
                    title="Editar usuário"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGeneratePassword(user)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Gerar senha"
                  >
                    <Key className="w-3 h-3" />
                  </Button>

                  {/* Apenas usuários master veem o botão de gerenciar empresas */}
                  {isMasterUser && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onManageCompanies(user)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Gerenciar empresas"
                    >
                      <Building2 className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Excluir usuário"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
