
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/hooks/usePlans";
import { useTemplates } from "@/hooks/useTemplates";
import { usePlanTemplates } from "@/hooks/usePlanTemplates";
import { PlanFormDialog } from "@/components/planos/PlanFormDialog";
import { PlanTable } from "@/components/planos/PlanTable";
import { PlanTemplateManager } from "@/components/planos/PlanTemplateManager";

export default function Planos() {
  const { toast } = useToast();
  const { plans, loading, createPlan, updatePlan, deletePlan } = usePlans();
  const { templates } = useTemplates();
  const { planTemplates, linkTemplateToPlan, unlinkTemplateFromPlan } = usePlanTemplates();

  const [editingPlan, setEditingPlan] = useState<any>(null);

  const savePlan = async (planData: any) => {
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, planData);
      } else {
        await createPlan(planData);
      }
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const editPlan = (plan: any) => {
    setEditingPlan(plan);
  };

  const handleDeletePlan = async (planId: string) => {
    await deletePlan(planId);
  };

  const getAssociatedTemplates = (planId: string) => {
    const associatedTemplateIds = planTemplates
      .filter(pt => pt.plan_id === planId)
      .map(pt => pt.template_id);
    
    return templates.filter(template => associatedTemplateIds.includes(template.id));
  };

  const handleTemplateToggle = async (planId: string, templateId: string, isLinked: boolean) => {
    if (isLinked) {
      await unlinkTemplateFromPlan(templateId, planId);
    } else {
      await linkTemplateToPlan(templateId, planId);
    }
  };

  const isTemplateLinkedToPlan = (planId: string, templateId: string) => {
    return planTemplates.some(pt => pt.plan_id === planId && pt.template_id === templateId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos</h1>
          <p className="text-gray-600 mt-2">Gerencie os planos e suas funcionalidades</p>
        </div>
        <PlanFormDialog
          editingPlan={editingPlan}
          onSave={savePlan}
          onCancel={() => setEditingPlan(null)}
        />
      </div>

      <Tabs defaultValue="planos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="templates">Gerenciar Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="planos">
          <PlanTable
            plans={plans}
            onEdit={editPlan}
            onDelete={handleDeletePlan}
            getAssociatedTemplates={getAssociatedTemplates}
          />
        </TabsContent>

        <TabsContent value="templates">
          <PlanTemplateManager
            plans={plans}
            templates={templates}
            isTemplateLinkedToPlan={isTemplateLinkedToPlan}
            onTemplateToggle={handleTemplateToggle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
