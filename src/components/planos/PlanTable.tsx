
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

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
}

export function PlanTable({ plans, onEdit, onDelete }: PlanTableProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum plano encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-center">Preço</TableHead>
            <TableHead className="text-center">Conexões SQL</TableHead>
            <TableHead className="text-center">Consultas SQL</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell className="text-gray-600">{plan.description || 'Sem descrição'}</TableCell>
              <TableCell className="text-center">
                <span className="font-semibold text-green-600">
                  R$ {plan.price.toFixed(2)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {plan.max_sql_connections}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {plan.max_sql_queries}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  className={plan.is_active 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-red-100 text-red-800 border-red-200"
                  }
                >
                  {plan.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onEdit(plan)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => onDelete(plan.id)}
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
