
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlanForm } from '@/components/plans/PlanForm';
import { PlanCard } from '@/components/plans/PlanCard';
import { usePlans, Plan } from '@/hooks/usePlans';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export default function Planos() {
  const { plans, loading, createPlan, updatePlan, deletePlan } = usePlans();
  const { userSubscription, createSubscription } = useSubscriptions();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, planData);
      } else {
        await createPlan(planData);
      }
      setShowForm(false);
      setEditingPlan(undefined);
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      await deletePlan(id);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await createSubscription(planId);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlan(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando planos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Planos</h1>
          <p className="text-gray-600">
            Gerencie os planos de assinatura e suas limitações
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {userSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">Seu Plano Atual</h2>
          <p className="text-sm text-blue-700">
            Você está no plano <strong>{userSubscription.plans?.name}</strong> - 
            {userSubscription.plans?.max_sql_connections} conexões SQL e {userSubscription.plans?.max_sql_queries} consultas por mês
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSubscribe={handleSubscribe}
            isSubscribed={userSubscription?.plan_id === plan.id}
          />
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum plano encontrado.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Plano
          </Button>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <PlanForm
            plan={editingPlan}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
