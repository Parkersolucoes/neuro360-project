
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

interface TemplateEmptyStateProps {
  onCreateTemplate: () => void;
}

export function TemplateEmptyState({ onCreateTemplate }: TemplateEmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-gray-300 bg-white">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
        <p className="text-gray-500 text-center mb-6">
          Comece criando um novo template personalizado
        </p>
        <Button onClick={onCreateTemplate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Criar Template
        </Button>
      </CardContent>
    </Card>
  );
}
