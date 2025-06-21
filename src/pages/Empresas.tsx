
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Edit, Trash2, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  plan: "basic" | "pro" | "enterprise";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  usersCount: number;
  lastActivity: string;
}

export default function Empresas() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      name: "Tech Solutions Ltda",
      document: "12.345.678/0001-90",
      email: "contato@techsolutions.com",
      phone: "(11) 3333-4444",
      address: "Rua das Flores, 123 - São Paulo, SP",
      plan: "pro",
      status: "active",
      createdAt: "2024-01-15",
      usersCount: 5,
      lastActivity: "2024-01-20"
    },
    {
      id: "2",
      name: "Comércio Digital S.A.",
      document: "98.765.432/0001-10",
      email: "admin@comerciodigital.com",
      phone: "(11) 5555-6666",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      plan: "enterprise",
      status: "active",
      createdAt: "2024-01-10",
      usersCount: 12,
      lastActivity: "2024-01-21"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    plan: "basic"
  });

  const plans = [
    { value: "basic", label: "Básico", color: "bg-gray-100 text-gray-800" },
    { value: "pro", label: "Profissional", color: "bg-blue-100 text-blue-800" },
    { value: "enterprise", label: "Empresarial", color: "bg-purple-100 text-purple-800" }
  ];

  const saveCompany = () => {
    if (editingCompany) {
      setCompanies(companies.map(company => 
        company.id === editingCompany.id 
          ? { ...editingCompany, ...newCompany }
          : company
      ));
      toast({
        title: "Empresa atualizada",
        description: "As informações da empresa foram atualizadas com sucesso!",
      });
    } else {
      const company: Company = {
        id: Date.now().toString(),
        ...newCompany,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0],
        usersCount: 0,
        lastActivity: new Date().toISOString().split('T')[0]
      };
      setCompanies([...companies, company]);
      toast({
        title: "Empresa criada",
        description: "A nova empresa foi criada com sucesso!",
      });
    }
    
    setNewCompany({ name: "", document: "", email: "", phone: "", address: "", plan: "basic" });
    setEditingCompany(null);
    setIsDialogOpen(false);
  };

  const editCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone,
      address: company.address,
      plan: company.plan
    });
    setIsDialogOpen(true);
  };

  const deleteCompany = (companyId: string) => {
    setCompanies(companies.filter(company => company.id !== companyId));
    toast({
      title: "Empresa removida",
      description: "A empresa foi removida com sucesso!",
    });
  };

  const getPlanLabel = (plan: string) => {
    const planObj = plans.find(p => p.value === plan);
    return planObj ? planObj.label : plan;
  };

  const getPlanColor = (plan: string) => {
    const planObj = plans.find(p => p.value === plan);
    return planObj ? planObj.color : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-2">Gerencie as empresas clientes do sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Editar Empresa" : "Nova Empresa"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Razão Social</Label>
                  <Input
                    id="name"
                    placeholder="Nome da empresa"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ</Label>
                  <Input
                    id="document"
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    value={newCompany.document}
                    onChange={(e) => setNewCompany({...newCompany, document: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 3333-4444"
                    value={newCompany.phone}
                    onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  placeholder="Endereço completo da empresa"
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <select
                  id="plan"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newCompany.plan}
                  onChange={(e) => setNewCompany({...newCompany, plan: e.target.value})}
                >
                  {plans.map((plan) => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingCompany(null);
                setNewCompany({ name: "", document: "", email: "", phone: "", address: "", plan: "basic" });
              }}>
                Cancelar
              </Button>
              <Button onClick={saveCompany} disabled={!newCompany.name || !newCompany.document || !newCompany.email}>
                {editingCompany ? "Atualizar" : "Criar"} Empresa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Empresas Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {companies.filter(c => c.status === "active").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-blue-600">
                  {companies.reduce((acc, c) => acc + c.usersCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span>Lista de Empresas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.document}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{company.email}</div>
                      <div className="text-sm text-gray-500">{company.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(company.plan)}>
                      {getPlanLabel(company.plan)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{company.usersCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      company.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : company.status === "suspended"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }>
                      {company.status === "active" ? "Ativa" : 
                       company.status === "suspended" ? "Suspensa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{company.lastActivity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editCompany(company)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteCompany(company.id)}
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
