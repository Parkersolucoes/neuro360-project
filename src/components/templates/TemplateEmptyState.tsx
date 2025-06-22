
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

interface TemplateEmptyStateProps {
  onCreateTemplate: () => void;
}

export function TemplateEmptyState({ onCreateTemplate }: TemplateEmptyStateProps) {
  return (
    <div className="p-12">
      <div className="text-center">
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum template encontrado</h3>
        <p className="text-gray-500 text-center mb-8 max-w-md mx-auto">
          Comece criando templates personalizados para suas mensagens de WhatsApp. Os templates padrão serão criados automaticamente.
        </p>
        <Button 
          onClick={onCreateTemplate} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar Primeiro Template
        </Button>
      </div>
    </div>
  );
}
