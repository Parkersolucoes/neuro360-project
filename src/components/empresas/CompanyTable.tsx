
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin, Settings } from "lucide-react";
import { Company } from "@/hooks/useCompanies";

interface CompanyTableProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (companyId: string) => void;
  onConfigureCompany: (company: Company) => void;
}

export function CompanyTable({ companies, onEditCompany, onDeleteCompany, onConfigureCompany }: CompanyTableProps) {
  const handleDeleteCompany = async (companyId: string) => {
    if (confirm("Tem certeza que deseja remover esta empresa?")) {
      await onDeleteCompany(companyId);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell>
              <div>
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-500 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{company.address || 'Endereço não informado'}</span>
                </div>
                <div className="text-sm text-gray-500">Criada em {new Date(company.created_at).toLocaleDateString()}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{company.email}</span>
                </div>
                {company.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{company.phone}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono text-sm">{company.document}</span>
            </TableCell>
            <TableCell>
              <Badge className={
                company.status === "active" 
                  ? "bg-green-100 text-green-800" 
                  : company.status === "inactive"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
              }>
                {company.status === "active" ? "Ativa" : 
                 company.status === "inactive" ? "Inativa" : "Suspensa"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onConfigureCompany(company)}
                  title="Configurações"
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditCompany(company)}
                  title="Editar"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteCompany(company.id)}
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
