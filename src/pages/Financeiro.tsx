
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, FileText, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useAssasConfig } from "@/hooks/useAssasConfig";

export default function Financeiro() {
  const { toast } = useToast();
  const { transactions, createTransaction, loading } = useTransactions();
  const { config: assasConfig } = useAssasConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBoleto, setNewBoleto] = useState({
    customer_name: "",
    customer_email: "",
    customer_document: "",
    amount: "",
    due_date: "",
    description: ""
  });

  const handleCreateBoleto = async () => {
    if (!assasConfig || assasConfig.status !== 'connected') {
      toast({
        title: "Erro",
        description: "Configure a integração com ASSAS primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await createTransaction({
        user_id: user.id,
        amount: parseFloat(newBoleto.amount),
        currency: "BRL",
        status: "pending" as const,
        payment_method: "boleto",
        description: newBoleto.description,
        transaction_date: new Date().toISOString(),
        subscription_id: null
      });
      
      setNewBoleto({
        customer_name: "",
        customer_email: "",
        customer_document: "",
        amount: "",
        due_date: "",
        description: ""
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Boleto criado com sucesso!"
      });
    } catch (error) {
      console.error('Error creating boleto:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar boleto",
        variant: "destructive"
      });
    }
  };

  const stats = [
    {
      title: "Receita Total",
      value: "R$ 15.430,00",
      subtitle: "Este mês",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Boletos Pendentes",
      value: "8",
      subtitle: "Aguardando pagamento",
      icon: FileText,
      color: "bg-yellow-500",
    },
    {
      title: "Transações",
      value: "142",
      subtitle: "Este mês",
      icon: CreditCard,
      color: "bg-blue-500",
    },
    {
      title: "Crescimento",
      value: "+12.5%",
      subtitle: "vs mês anterior",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-2">Gerencie planos e emita boletos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Boleto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Boleto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Nome do Cliente</Label>
                <Input
                  id="customer_name"
                  value={newBoleto.customer_name}
                  onChange={(e) => setNewBoleto({...newBoleto, customer_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">E-mail</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={newBoleto.customer_email}
                  onChange={(e) => setNewBoleto({...newBoleto, customer_email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_document">CPF/CNPJ</Label>
                <Input
                  id="customer_document"
                  value={newBoleto.customer_document}
                  onChange={(e) => setNewBoleto({...newBoleto, customer_document: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newBoleto.amount}
                  onChange={(e) => setNewBoleto({...newBoleto, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newBoleto.due_date}
                  onChange={(e) => setNewBoleto({...newBoleto, due_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newBoleto.description}
                  onChange={(e) => setNewBoleto({...newBoleto, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBoleto}>
                Gerar Boleto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span>Transações Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.description || 'Transação'}</TableCell>
                  <TableCell>R$ {Number(transaction.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={
                      transaction.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : transaction.status === "pending"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }>
                      {transaction.status === "completed" ? "Pago" : 
                       transaction.status === "pending" ? "Pendente" : "Falhou"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
