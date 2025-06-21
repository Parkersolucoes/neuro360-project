
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Edit, Trash2, Database, MessageSquare, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/hooks/usePlans";
import { useTemplates } from "@/hooks/useTemplates";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function Planos() {
  const { toast } = useToast();
  const { plans, loading, createPlan, updatePlan, deletePlan } = usePlans();
  const { templates, planTemplates, linkTemplateToPlan, unlinkTemplateFromPlan } = useTemplates();
  const { isAdmin } = useAdminAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: 0,
    max_sql_connections: 1,
    max_sql_queries: 10,
    is_active: true
  });

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const savePlan = async () => {
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, newPlan);
      } else {
        await createPlan(newPlan);
      }
      
      setNewPlan({ 
        name: "", 
        description: "", 
        price: 0, 
        max_sql_connections: 1, 
        max_sql_queries: 10, 
        is_active: true 
      });
      setEditingPlan(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const editPlan = (plan: any) => {
    setEditingPlan(plan);
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

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Tem certeza que deseja remover este plano?")) {
      await deletePlan(planId);
    }
  };

  const getAssociatedTemplates = (planId: string) => {
    const associatedTemplateIds = planTemplates
      .filter(pt => pt.plan_id === planId)
      .map(pt => pt.template_id);
    
    return templates.filter(template => associatedTemplateIds.includes(template.id));
  };

  const handleTemplateToggle = async (planId: string, templateId: string, isLinked: boolean) => {
    try {
      if (isLinked) {
        await unlinkTemplateFromPlan(templateId, planId);
      } else {
        await linkTemplateToPlan(templateId, planId);
      }
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  const isTemplateLinkedToPlan = (planId: string, templateId: string) => {
    return planTemplates.some(pt => pt.plan_id === planId && pt.template_id === templateId);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">
            Esta página é exclusiva para administradores do sistema.
          </p>
        </div>
      </div>
    );
  }

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
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingPlan(null);
                setNewPlan({ 
                  name: "", 
                  description: "", 
                  price: 0, 
                  max_sql_connections: 1, 
                  max_sql_queries: 10, 
                  is_active: true 
                });
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={savePlan} 
                disabled={!newPlan.name}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingPlan ? "Atualizar" : "Criar"} Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="planos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="templates">Gerenciar Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="planos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span>Lista de Planos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Limites</TableHead>
                    <TableHead>Templates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          {plan.description && (
                            <div className="text-sm text-gray-500">{plan.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">R$ {plan.price.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Database className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{plan.max_sql_connections} conexões</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{plan.max_sql_queries} consultas</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{getAssociatedTemplates(plan.id).length} templates</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          plan.is_active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }>
                          {plan.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editPlan(plan)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeletePlan(plan.id)}
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
        </TabsContent>

        <TabsContent value="templates">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
