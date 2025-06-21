import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Users, Edit, Trash2, Phone, Mail, Shield, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUsers, User } from "@/hooks/useUsers";
import { useCompanies } from "@/hooks/useCompanies";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function Usuarios() {
  const { toast } = useToast();
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const { companies } = useCompanies();
  const { isAdmin } = useAdminAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    role: "user",
    department: "",
    company_id: "",
    is_admin: false,
    status: "active" as 'active' | 'inactive'
  });

  const roles = [
    { value: "admin", label: "Administrador" },
    { value: "manager", label: "Gerente" },
    { value: "user", label: "Usuário" }
  ];

  const departments = [
    { value: "vendas", label: "Vendas" },
    { value: "marketing", label: "Marketing" },
    { value: "financeiro", label: "Financeiro" },
    { value: "ti", label: "TI" },
    { value: "rh", label: "Recursos Humanos" }
  ];

  const saveUser = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, newUser);
      } else {
        await createUser(newUser);
      }
      
      setNewUser({ 
        name: "", 
        email: "", 
        phone: "", 
        whatsapp: "", 
        role: "user", 
        department: "", 
        company_id: "", 
        is_admin: false,
        status: "active"
      });
      setEditingUser(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      role: user.role,
      department: user.department,
      company_id: user.company_id || "",
      is_admin: user.is_admin,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await deleteUser(userId);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : "Sem empresa";
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">
            Esta página é exclusiva para administradores do sistema.
          </p>
        </div>
      </div>
    );
  }

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Nome do usuário"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={newUser.whatsapp}
                  onChange={(e) => setNewUser({...newUser, whatsapp: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Select value={newUser.company_id} onValueChange={(value) => setNewUser({...newUser, company_id: value})}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newUser.status} 
                  onValueChange={(value: 'active' | 'inactive') => setNewUser({...newUser, status: value})}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-center space-x-2 col-span-2">
                <Checkbox
                  id="is_admin"
                  checked={newUser.is_admin}
                  onCheckedChange={(checked) => setNewUser({...newUser, is_admin: checked as boolean})}
                />
                <Label htmlFor="is_admin" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Usuário Administrador (recebe alertas de erro)</span>
                </Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingUser(null);
                setNewUser({ 
                  name: "", 
                  email: "", 
                  phone: "", 
                  whatsapp: "", 
                  role: "user", 
                  department: "", 
                  company_id: "", 
                  is_admin: false,
                  status: "active"
                });
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={saveUser} 
                disabled={!newUser.name || !newUser.email || !newUser.phone || !newUser.whatsapp || !newUser.department}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingUser ? "Atualizar" : "Criar"} Usuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Lista de Usuários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Empresa</TableHead>
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
                  <TableCell>{getCompanyName(user.company_id!)}</TableCell>
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
                        onClick={() => editUser(user)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
