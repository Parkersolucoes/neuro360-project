
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plan } from '@/hooks/usePlans';

interface PlanFormProps {
  plan?: Plan;
  onSubmit: (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PlanForm({ plan, onSubmit, onCancel, loading }: PlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    max_sql_connections: plan?.max_sql_connections || 1,
    max_sql_queries: plan?.max_sql_queries || 10,
    is_active: plan?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{plan ? 'Editar Plano' : 'Novo Plano'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="max_sql_connections">Máximo de Conexões SQL</Label>
            <Input
              id="max_sql_connections"
              type="number"
              min="1"
              value={formData.max_sql_connections}
              onChange={(e) => setFormData({ ...formData, max_sql_connections: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="max_sql_queries">Máximo de Consultas SQL</Label>
            <Input
              id="max_sql_queries"
              type="number"
              min="1"
              value={formData.max_sql_queries}
              onChange={(e) => setFormData({ ...formData, max_sql_queries: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Plano Ativo</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
