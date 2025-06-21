
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface PlanFormData {
  name: string;
  description: string;
  price: number;
  max_sql_connections: number;
  max_sql_queries: number;
  is_active: boolean;
}

interface PlanFormDialogProps {
  editingPlan: any;
  onSave: (planData: PlanFormData) => Promise<void>;
  onCancel: () => void;
}

export function PlanFormDialog({ editingPlan, onSave, onCancel }: PlanFormDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<PlanFormData>({
    name: "",
    description: "",
    price: 0,
    max_sql_connections: 1,
    max_sql_queries: 10,
    is_active: true
  });

  const handleEdit = (plan: any) => {
    setNewPlan({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      max_sql_connections: plan.max_sql_connections,
      max_sql_queries: plan.max_sql_queries,
      is_active: plan.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await onSave(newPlan);
      setNewPlan({ 
        name: "", 
        description: "", 
        price: 0, 
        max_sql_connections: 1, 
        max_sql_queries: 10, 
        is_active: true 
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setNewPlan({ 
      name: "", 
      description: "", 
      price: 0, 
      max_sql_connections: 1, 
      max_sql_queries: 10, 
      is_active: true 
    });
    onCancel();
  };

  // Se há um plano sendo editado, abrir o dialog automaticamente
  if (editingPlan && !isDialogOpen) {
    handleEdit(editingPlan);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? "Editar Plano" : "Novo Plano"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              placeholder="Nome do plano"
              value={newPlan.name}
              onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newPlan.price}
              onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value) || 0})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_sql_connections">Máx. Conexões SQL</Label>
            <Input
              id="max_sql_connections"
              type="number"
              placeholder="1"
              value={newPlan.max_sql_connections}
              onChange={(e) => setNewPlan({...newPlan, max_sql_connections: parseInt(e.target.value) || 1})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_sql_queries">Máx. Consultas SQL</Label>
            <Input
              id="max_sql_queries"
              type="number"
              placeholder="10"
              value={newPlan.max_sql_queries}
              onChange={(e) => setNewPlan({...newPlan, max_sql_queries: parseInt(e.target.value) || 10})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição do plano"
              value={newPlan.description}
              onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2 col-span-2">
            <Switch
              id="is_active"
              checked={newPlan.is_active}
              onCheckedChange={(checked) => setNewPlan({...newPlan, is_active: checked})}
            />
            <Label htmlFor="is_active">Plano Ativo</Label>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!newPlan.name}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingPlan ? "Atualizar" : "Criar"} Plano
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
