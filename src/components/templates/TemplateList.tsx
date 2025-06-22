
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, XCircle, Eye, Edit, Trash2, Hash } from "lucide-react";
import { Template } from "@/hooks/useTemplates";

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => Promise<void>;
  onView: (template: Template) => void;
  getTypeLabel: (type: string) => string;
}

export function TemplateList({ 
  templates, 
  onEdit, 
  onDelete, 
  onView,
  getTypeLabel
}: TemplateListProps) {
  const getStatusIcon = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <XCircle className="w-3 h-3 text-gray-500" />;
    }
    
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      default:
        return <XCircle className="w-3 h-3 text-red-600" />;
    }
  };

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-base font-medium mb-1">Nenhum template cadastrado</p>
        <p className="text-sm">Clique em "Novo Template" para começar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="h-auto transition-all hover:shadow-md border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
                {template.name}
              </CardTitle>
              <div className="flex items-center space-x-1 ml-2">
                {getStatusIcon(template.status, template.is_active)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {template.description && (
              <p className="text-gray-600 text-xs line-clamp-2">{template.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {getTypeLabel(template.type)}
              </Badge>
              <Badge variant="outline" className="capitalize border-gray-300 text-gray-700 bg-gray-50">
                {template.category.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="bg-gray-50 rounded-md p-2">
              <div className="flex items-center space-x-1 mb-1">
                <MessageSquare className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Conteúdo:</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-3">
                {template.content.length > 80 
                  ? `${template.content.substring(0, 80)}...` 
                  : template.content
                }
              </p>
            </div>

            {template.variables && template.variables.length > 0 && (
              <div className="bg-orange-50 rounded-md p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <Hash className="w-3 h-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">Variáveis:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.variables.slice(0, 3).map((variable, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                      {variable}
                    </Badge>
                  ))}
                  {template.variables.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                      +{template.variables.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <Badge 
              className={`text-xs ${
                template.is_active && template.status === "active" 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {template.is_active && template.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
            
            <div className="flex items-center justify-between space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(template)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1 text-xs h-7"
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(template)}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-7 px-2"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                onClick={() => onDelete(template.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            {template.updated_at && (
              <p className="text-xs text-gray-500 text-center">
                {new Date(template.updated_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
