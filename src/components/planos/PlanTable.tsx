
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Trash2, Database, Zap, MessageSquare } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_sql_connections: number;
  max_sql_queries: number;
  is_active: boolean;
}

interface PlanTableProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (planId: string) => void;
  getAssociatedTemplates: (planId: string) => any[];
}

export function PlanTable({ plans, onEdit, onDelete, getAssociatedTemplates }: PlanTableProps) {
  const handleDeletePlan = async (planId: string) => {
    if (confirm("Tem certeza que deseja remover este plano?")) {
      await onDelete(planId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-500" />
          <span>Lista de Planos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Limites</TableHead>
              <TableHead>Templates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    {plan.description && (
                      <div className="text-sm text-gray-500">{plan.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">R$ {plan.price.toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Database className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{plan.max_sql_connections} conexões</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{plan.max_sql_queries} consultas</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{getAssociatedTemplates(plan.id).length} templates</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={
                    plan.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }>
                    {plan.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(plan)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeletePlan(plan.id)}
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
  );
}
