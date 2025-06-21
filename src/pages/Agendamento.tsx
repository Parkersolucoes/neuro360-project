
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, Play, Pause, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  id: string;
  name: string;
  query: string;
  template: string;
  frequency: string;
  time: string;
  recipients: string;
  company: string;
  status: "active" | "paused" | "completed";
  nextExecution: string;
  lastExecution: string;
}

export default function Agendamento() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "1",
      name: "Relatório Diário de Vendas",
      query: "Vendas Diárias",
      template: "Relatório de Vendas",
      frequency: "daily",
      time: "08:00",
      recipients: "Vendas",
      company: "Empresa A",
      status: "active",
      nextExecution: "2024-01-22 08:00",
      lastExecution: "2024-01-21 08:00"
    },
    {
      id: "2",
      name: "Cobrança Semanal",
      query: "Clientes Inadimplentes",
      template: "Cobrança Amigável",
      frequency: "weekly",
      time: "09:00",
      recipients: "Financeiro",
      company: "Empresa A",
      status: "active",
      nextExecution: "2024-01-29 09:00",
      lastExecution: "2024-01-22 09:00"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    query: "",
    template: "",
    frequency: "",
    time: "",
    recipients: "",
    company: ""
  });

  const frequencies = [
    { value: "daily", label: "Diário" },
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensal" }
  ];

  const queries = [
    { value: "vendas_diarias", label: "Vendas Diárias" },
    { value: "clientes_inadimplentes", label: "Clientes Inadimplentes" }
  ];

  const templates = [
    { value: "relatorio_vendas", label: "Relatório de Vendas" },
    { value: "cobranca_amigavel", label: "Cobrança Amigável" }
  ];

  const recipients = [
    { value: "vendas", label: "Vendas" },
    { value: "financeiro", label: "Financeiro" },
    { value: "gerencia", label: "Gerência" }
  ];

  const companies = [
    { value: "empresa_a", label: "Empresa A" },
    { value: "empresa_b", label: "Empresa B" }
  ];

  const saveSchedule = () => {
    const schedule: Schedule = {
      id: Date.now().toString(),
      ...newSchedule,
      status: "active",
      nextExecution: "2024-01-22 " + newSchedule.time,
      lastExecution: ""
    };
    
    setSchedules([...schedules, schedule]);
    setNewSchedule({ name: "", query: "", template: "", frequency: "", time: "", recipients: "", company: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Agendamento criado",
      description: "O novo agendamento foi criado com sucesso!",
    });
  };

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, status: schedule.status === "active" ? "paused" : "active" }
        : schedule
    ));
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    toast({
      title: "Agendamento removido",
      description: "O agendamento foi removido com sucesso!",
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const freq = frequencies.find(f => f.value === frequency);
    return freq ? freq.label : frequency;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamento</h1>
          <p className="text-gray-600 mt-2">Gerencie os envios automáticos de mensagens</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Agendamento</Label>
                <Input
                  id="name"
                  placeholder="Nome descritivo do agendamento"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="query">Consulta SQL</Label>
                  <Select value={newSchedule.query} onValueChange={(value) => setNewSchedule({...newSchedule, query: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      {queries.map((query) => (
                        <SelectItem key={query.value} value={query.value}>
                          {query.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={newSchedule.template} onValueChange={(value) => setNewSchedule({...newSchedule, template: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select value={newSchedule.frequency} onValueChange={(value) => setNewSchedule({...newSchedule, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipients">Destinatários</Label>
                  <Select value={newSchedule.recipients} onValueChange={(value) => setNewSchedule({...newSchedule, recipients: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione os destinatários" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.map((recipient) => (
                        <SelectItem key={recipient.value} value={recipient.value}>
                          {recipient.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Select value={newSchedule.company} onValueChange={(value) => setNewSchedule({...newSchedule, company: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.value} value={company.value}>
                          {company.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveSchedule} disabled={!newSchedule.name || !newSchedule.query || !newSchedule.template}>
                Criar Agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Agendamentos Ativos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Configuração</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Próxima Execução</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{schedule.name}</div>
                      <div className="text-sm text-gray-500">{schedule.company}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Consulta:</span> {schedule.query}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Template:</span> {schedule.template}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Destinatários:</span> {schedule.recipients}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{getFrequencyLabel(schedule.frequency)} às {schedule.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {schedule.nextExecution}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      schedule.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : schedule.status === "paused"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }>
                      {schedule.status === "active" ? "Ativo" : 
                       schedule.status === "paused" ? "Pausado" : "Concluído"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSchedule(schedule.id)}
                      >
                        {schedule.status === "active" ? 
                          <Pause className="w-3 h-3" /> : 
                          <Play className="w-3 h-3" />
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteSchedule(schedule.id)}
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
    </div>
  );
}
