
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MessageSquare } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
}

interface PlanTemplateManagerProps {
  plans: Plan[];
  templates: Template[];
  isTemplateLinkedToPlan: (planId: string, templateId: string) => boolean;
  onTemplateToggle: (planId: string, templateId: string, isLinked: boolean) => Promise<void>;
}

export function PlanTemplateManager({ 
  plans, 
  templates, 
  isTemplateLinkedToPlan, 
  onTemplateToggle 
}: PlanTemplateManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleTemplateToggle = async (planId: string, templateId: string, isLinked: boolean) => {
    try {
      await onTemplateToggle(planId, templateId, isLinked);
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <span>Gerenciar Templates por Plano</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <Label className="text-base font-medium mb-3 block">Selecione um Plano</Label>
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-sm text-gray-500">R$ {plan.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-8">
            {selectedPlan ? (
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Templates para {plans.find(p => p.id === selectedPlan)?.name}
                </Label>
                <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-500">{template.description}</div>
                        )}
                        <Badge variant="outline" className="mt-1 text-xs">
                          {template.type}
                        </Badge>
                      </div>
                      <Switch
                        checked={isTemplateLinkedToPlan(selectedPlan, template.id)}
                        onCheckedChange={(checked) => 
                          handleTemplateToggle(selectedPlan, template.id, !checked)
                        }
                      />
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Nenhum template disponível
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Selecione um plano para gerenciar seus templates
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
