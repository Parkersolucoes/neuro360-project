
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Edit, Trash2 } from "lucide-react";
import { Template } from "@/hooks/useTemplates";

interface TemplateListProps {
  templates: Template[];
  onEditTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: string) => void;
  getTypeLabel: (type: string) => string;
  getAssociatedPlans: (templateId: string) => any[];
}

export function TemplateList({
  templates,
  onEditTemplate,
  onDeleteTemplate,
  getTypeLabel,
  getAssociatedPlans
}: TemplateListProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-indigo-50 border-b">
        <CardTitle className="flex items-center space-x-2 text-indigo-800">
          <MessageSquare className="w-5 h-5" />
          <span>Lista de Templates ({templates.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b">
              <TableHead className="font-semibold text-gray-700">Nome</TableHead>
              <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
              <TableHead className="font-semibold text-gray-700">Categoria</TableHead>
              <TableHead className="font-semibold text-gray-700">Planos Associados</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Criado em</TableHead>
              <TableHead className="font-semibold text-gray-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-gray-500">{template.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-indigo-100 text-indigo-800">
                    {getTypeLabel(template.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-gray-300 text-gray-700">
                    {template.category.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {getAssociatedPlans(template.id).map((plan) => (
                      <Badge key={plan.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {plan.name}
                      </Badge>
                    ))}
                    {getAssociatedPlans(template.id).length === 0 && (
                      <span className="text-sm text-gray-500">Nenhum plano</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={
                    template.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }>
                    {template.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {new Date(template.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditTemplate(template)}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => onDeleteTemplate(template.id)}
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
