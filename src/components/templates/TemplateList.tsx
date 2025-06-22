
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
    <div className="p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 border-b border-gray-200">
            <TableHead className="font-semibold text-gray-700 py-4">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Tipo</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Categoria</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Planos Associados</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Criado em</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template, index) => (
            <TableRow 
              key={template.id} 
              className={`hover:bg-blue-50 border-b border-gray-100 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <TableCell className="py-4">
                <div>
                  <div className="font-medium text-gray-900">{template.name}</div>
                  {template.description && (
                    <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {getTypeLabel(template.type)}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="capitalize border-gray-300 text-gray-700 bg-gray-50">
                  {template.category.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-wrap gap-1">
                  {getAssociatedPlans(template.id).map((plan) => (
                    <Badge key={plan.id} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {plan.name}
                    </Badge>
                  ))}
                  {getAssociatedPlans(template.id).length === 0 && (
                    <span className="text-sm text-gray-500">Nenhum plano</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge className={
                  template.is_active 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }>
                  {template.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600 py-4">
                {new Date(template.created_at).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditTemplate(template)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
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
    </div>
  );
}
