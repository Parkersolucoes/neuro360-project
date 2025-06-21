
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "pending" | "sent" | "failed";
  recipients: string;
  message: string;
  createdAt: string;
}

export default function Agendamento() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "1",
      title: "Promoção Black Friday",
      description: "Envio de mensagem promocional para clientes",
      scheduledDate: "2024-11-29",
      scheduledTime: "09:00",
      status: "pending",
      recipients: "Lista VIP",
      message: "🔥 BLACK FRIDAY! 50% OFF em todos os produtos! Aproveite!",
      createdAt: "2024-01-15"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    recipients: "",
    message: ""
  });

  const saveSchedule = () => {
    if (editingSchedule) {
      setSchedules(schedules.map(schedule => 
        schedule.id === editingSchedule.id 
          ? { ...editingSchedule, ...newSchedule }
          : schedule
      ));
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso!",
      });
    } else {
      const schedule: Schedule = {
        id: Date.now().toString(),
        ...newSchedule,
        status: "pending",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSchedules([...schedules, schedule]);
      toast({
        title: "Agendamento criado",
        description: "O novo agendamento foi criado com sucesso!",
      });
    }
    
    setNewSchedule({ 
      title: "", 
      description: "", 
      scheduledDate: "", 
      scheduledTime: "", 
      recipients: "", 
      message: "" 
    });
    setEditingSchedule(null);
    setIsDialogOpen(false);
  };

  const editSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setNewSchedule({
      title: schedule.title,
      description: schedule.description,
      scheduledDate: schedule.scheduledDate,
      scheduledTime: schedule.scheduledTime,
      recipients: schedule.recipients,
      message: schedule.message
    });
    setIsDialogOpen(true);
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    toast({
      title: "Agendamento removido",
      description: "O agendamento foi removido com sucesso!",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "sent":
        return "Enviado";
      case "failed":
        return "Falhou";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamento</h1>
          <p className="text-gray-600 mt-2">Gerencie o envio programado de mensagens</p>
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
              <DialogTitle>
                {editingSchedule ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Título do agendamento"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipients">Destinatários</Label>
                <Input
                  id="recipients"
                  placeholder="Lista ou grupo de destinatários"
                  value={newSchedule.recipients}
                  onChange={(e) => setNewSchedule({...newSchedule, recipients: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Data</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={newSchedule.scheduledDate}
                  onChange={(e) => setNewSchedule({...newSchedule, scheduledDate: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Horário</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={newSchedule.scheduledTime}
                  onChange={(e) => setNewSchedule({...newSchedule, scheduledTime: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição do agendamento"
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite a mensagem que será enviada..."
                  value={newSchedule.message}
                  onChange={(e) => setNewSchedule({...newSchedule, message: e.target.value})}
                  className="min-h-24 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingSchedule(null);
                setNewSchedule({ 
                  title: "", 
                  description: "", 
                  scheduledDate: "", 
                  scheduledTime: "", 
                  recipients: "", 
                  message: "" 
                });
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={saveSchedule} 
                disabled={!newSchedule.title || !newSchedule.scheduledDate || !newSchedule.scheduledTime || !newSchedule.message}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingSchedule ? "Atualizar" : "Criar"} Agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Agendamentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Destinatários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{schedule.title}</div>
                      <div className="text-sm text-gray-500">{schedule.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{new Date(schedule.scheduledDate).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{schedule.scheduledTime}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{schedule.recipients}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(schedule.status)}>
                      {getStatusLabel(schedule.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{schedule.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editSchedule(schedule)}
                      >
                        <Edit className="w-3 h-3" />
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
