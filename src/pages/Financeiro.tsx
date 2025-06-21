
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { usePlans } from '@/hooks/usePlans';

export default function Financeiro() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { subscriptions, fetchAllSubscriptions } = useSubscriptions();
  const { plans } = usePlans();

  React.useEffect(() => {
    fetchAllSubscriptions();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date);
      const currentMonth = new Date();
      return t.status === 'completed' &&
        transactionDate.getMonth() === currentMonth.getMonth() &&
        transactionDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pendente', variant: 'secondary' as const },
      'completed': { label: 'Concluída', variant: 'default' as const },
      'failed': { label: 'Falhou', variant: 'destructive' as const },
      'refunded': { label: 'Reembolsada', variant: 'outline' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dados financeiros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel Financeiro</h1>
        <p className="text-muted-foreground">
          Acompanhe receitas, transações e assinaturas
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Todas as transações concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Receita deste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com planos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Todas as transações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const statusInfo = getStatusBadge(transaction.status);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                    <TableCell>
                      {transaction.user_subscriptions?.plans?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.payment_method || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
