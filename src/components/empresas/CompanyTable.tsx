
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, Calendar, Settings } from "lucide-react";

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

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
  onConfigure?: (company: Company) => void;
}

const plans = [
  { value: "basic", label: "Básico", color: "bg-gray-100 text-gray-800" },
  { value: "pro", label: "Profissional", color: "bg-blue-100 text-blue-800" },
  { value: "enterprise", label: "Empresarial", color: "bg-purple-100 text-purple-800" }
];

export function CompanyTable({ companies, onEdit, onDelete, onConfigure }: CompanyTableProps) {
  const getPlanLabel = (plan: string) => {
    const planObj = plans.find(p => p.value === plan);
    return planObj ? planObj.label : plan;
  };

  const getPlanColor = (plan: string) => {
    const planObj = plans.find(p => p.value === plan);
    return planObj ? planObj.color : "bg-gray-100 text-gray-800";
  };

  return (
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
                  onClick={() => onEdit(company)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                {onConfigure && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onConfigure(company)}
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(company.id)}
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
