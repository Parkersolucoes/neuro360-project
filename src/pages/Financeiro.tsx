
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Users, CreditCard, FileText, Plus } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { usePlans } from '@/hooks/usePlans';
import { useAssasConfig } from '@/hooks/useAssasConfig';
import { useToast } from '@/hooks/use-toast';

export default function Financeiro() {
  const { transactions, loading: transactionsLoading, createTransaction } = useTransactions();
  const { subscriptions, fetchAllSubscriptions } = useSubscriptions();
  const { plans } = usePlans();
  const { config: assasConfig } = useAssasConfig();
  const { toast } = useToast();
  
  const [showBoletoDialog, setShowBoletoDialog] = useState(false);
  const [boletoForm, setBoletoForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_document: '',
    description: '',
    amount: '',
    due_date: ''
  });

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

  const handleCreateBoleto = async () => {
    if (!assasConfig) {
      toast({
        title: "Configuração ASSAS necessária",
        description: "Configure a integração ASSAS primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simular criação de boleto via ASSAS
      await createTransaction({
        amount: parseFloat(boletoForm.amount),
        currency: 'BRL',
        status: 'pending',
        payment_method: 'boleto',
        description: boletoForm.description,
        transaction_date: new Date().toISOString()
      });

      toast({
        title: "Boleto criado",
        description: "Boleto criado com sucesso!"
      });

      setBoletoForm({
        customer_name: '',
        customer_email: '',
        customer_document: '',
        description: '',
        amount: '',
        due_date: ''
      });
      setShowBoletoDialog(false);
    } catch (error) {
      console.error('Error creating boleto:', error);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Financeiro</h1>
          <p className="text-gray-600">
            Acompanhe receitas, transações e assinaturas
          </p>
        </div>
        
        <Dialog open={showBoletoDialog} onOpenChange={setShowBoletoDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Emitir Boleto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Emitir Boleto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nome do Cliente</Label>
                  <Input
                    id="customer_name"
                    value={boletoForm.customer_name}
                    onChange={(e) => setBoletoForm({...boletoForm, customer_name: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_document">CPF/CNPJ</Label>
                  <Input
                    id="customer_document"
                    value={boletoForm.customer_document}
                    onChange={(e) => setBoletoForm({...boletoForm, customer_document: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">E-mail</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={boletoForm.customer_email}
                  onChange={(e) => setBoletoForm({...boletoForm, customer_email: e.target.value})}
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={boletoForm.amount}
                    onChange={(e) => setBoletoForm({...boletoForm, amount: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={boletoForm.due_date}
                    onChange={(e) => setBoletoForm({...boletoForm, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={boletoForm.description}
                  onChange={(e) => setBoletoForm({...boletoForm, description: e.target.value})}
                  placeholder="Descrição do boleto"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBoletoDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateBoleto}
                  disabled={!boletoForm.customer_name || !boletoForm.amount || !boletoForm.due_date}
                >
                  Criar Boleto
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-600">
              Todas as transações concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-gray-600">
              Receita deste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-gray-600">
              Usuários com planos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-gray-600">
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
              <p className="text-gray-600">Nenhuma transação encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
