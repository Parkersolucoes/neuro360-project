
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Database, Search } from 'lucide-react';
import { Plan } from '@/hooks/usePlans';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
  onSubscribe?: (planId: string) => void;
  isSubscribed?: boolean;
  showActions?: boolean;
}

export function PlanCard({ plan, onEdit, onDelete, onSubscribe, isSubscribed, showActions = true }: PlanCardProps) {
  return (
    <Card className={`relative ${isSubscribed ? 'ring-2 ring-primary' : ''}`}>
      {isSubscribed && (
        <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
          Plano Atual
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <div className="text-2xl font-bold text-primary mt-2">
              R$ {plan.price.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </div>
          </div>
          <Badge variant={plan.is_active ? 'default' : 'secondary'}>
            {plan.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {plan.description && (
          <p className="text-muted-foreground mb-4">{plan.description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm">
              {plan.max_sql_connections} {plan.max_sql_connections === 1 ? 'conexão' : 'conexões'} SQL
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-sm">
              {plan.max_sql_queries} consultas por mês
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {onSubscribe && !isSubscribed && (
              <Button onClick={() => onSubscribe(plan.id)} className="flex-1">
                Assinar
              </Button>
            )}
            <Button onClick={() => onEdit(plan)} variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button onClick={() => onDelete(plan.id)} variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
