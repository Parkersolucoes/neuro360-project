
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin, Settings, Database, MessageSquare } from "lucide-react";
import { Company } from "@/hooks/useCompanies";
import { usePlans } from "@/hooks/usePlans";
import { useCompanyStats } from "@/hooks/useCompanyStats";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";

interface CompanyTableProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (companyId: string) => void;
  onConfigureCompany: (company: Company) => void;
}

export function CompanyTable({ companies, onEditCompany, onDeleteCompany, onConfigureCompany }: CompanyTableProps) {
  const { plans } = usePlans();
  const { stats } = useCompanyStats();
  const { currentCompany } = useCompanies();
  const { toast } = useToast();

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm("Tem certeza que deseja remover esta empresa?")) {
      await onDeleteCompany(companyId);
    }
  };

  const handleConfigureCompany = (company: Company) => {
    // Verificar se a empresa selecionada é a mesma do menu principal
    if (!currentCompany) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada no menu principal.",
        variant: "destructive"
      });
      return;
    }

    if (currentCompany.id !== company.id) {
      toast({
        title: "Acesso Negado",
        description: `Só é possível configurar a empresa atualmente selecionada (${currentCompany.name}). Selecione a empresa ${company.name} no menu principal primeiro.`,
        variant: "destructive"
      });
      return;
    }

    onConfigureCompany(company);
  };

  const getCompanyPlan = (planId: string | null) => {
    if (!planId) return null;
    return plans.find(plan => plan.id === planId);
  };

  const getCompanyStats = (companyId: string) => {
    return stats.find(stat => stat.company_id === companyId) || {
      company_id: companyId,
      sql_connections_count: 0,
      active_sql_connections_count: 0,
      sql_queries_count: 0
    };
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Plano</TableHead>
          <TableHead>Uso de Recursos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => {
          const plan = getCompanyPlan(company.plan_id);
          const companyStats = getCompanyStats(company.id);
          const isCurrentCompany = currentCompany?.id === company.id;
          
          return (
            <TableRow key={company.id} className={isCurrentCompany ? "bg-blue-50" : ""}>
              <TableCell>
                <div>
                  <div className="font-medium flex items-center space-x-2">
                    <span>{company.name}</span>
                    {isCurrentCompany && (
                      <Badge variant="default" className="text-xs bg-blue-600">
                        Selecionada
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{company.address || 'Endereço não informado'}</span>
                  </div>
                  <div className="text-sm text-gray-500 font-mono">{company.document}</div>
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
                {plan ? (
                  <div>
                    <div className="font-medium text-sm">{plan.name}</div>
                    <div className="text-xs text-gray-500">
                      R$ {plan.price.toFixed(2)}/mês
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-orange-600">
                    Sem plano
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {plan ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <Database className="w-3 h-3 text-blue-500" />
                      <span>Conexões: {companyStats.sql_connections_count}/{plan.max_sql_connections}</span>
                      {companyStats.sql_connections_count >= plan.max_sql_connections && (
                        <Badge variant="destructive" className="text-xs">Limite</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <MessageSquare className="w-3 h-3 text-green-500" />
                      <span>Consultas: {companyStats.sql_queries_count}/{plan.max_sql_queries}</span>
                      {companyStats.sql_queries_count >= plan.max_sql_queries && (
                        <Badge variant="destructive" className="text-xs">Limite</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Configure um plano</span>
                )}
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
                    variant={isCurrentCompany ? "default" : "outline"}
                    onClick={() => handleConfigureCompany(company)}
                    title={isCurrentCompany ? "Configurações" : "Selecione esta empresa no menu principal para configurar"}
                    disabled={!isCurrentCompany}
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
          );
        })}
      </TableBody>
    </Table>
  );
}
