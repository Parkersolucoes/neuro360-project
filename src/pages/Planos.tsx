
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/hooks/usePlans";
import { PlanFormDialog } from "@/components/planos/PlanFormDialog";
import { PlanTable } from "@/components/planos/PlanTable";

export default function Planos() {
  const { toast } = useToast();
  const { plans, loading, createPlan, updatePlan, deletePlan } = usePlans();
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

      <PlanTable
        plans={plans}
        onEdit={editPlan}
        onDelete={handleDeletePlan}
      />
    </div>
  );
}
