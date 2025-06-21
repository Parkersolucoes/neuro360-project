
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit, Trash2, Clock, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScheduling, Scheduling } from "@/hooks/useScheduling";
import { useTemplates } from "@/hooks/useTemplates";
import { useCompanies } from "@/hooks/useCompanies";

export default function Agendamento() {
  const { toast } = useToast();
  const { schedulings, loading, createScheduling, updateScheduling, deleteScheduling } = useScheduling();
  const { templates } = useTemplates();
  const { currentCompany } = useCompanies();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScheduling, setEditingScheduling] = useState<Scheduling | null>(null);
  const [newScheduling, setNewScheduling] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    recipient_phone: "",
    message_content: "",
    template_id: "",
    company_id: currentCompany?.id || "",
    status: "pending" as const
  });

  const saveScheduling = async () => {
    try {
      if (editingScheduling) {
        await updateScheduling(editingScheduling.id, newScheduling);
      } else {
        await createScheduling(newScheduling);
      }
      
      setNewScheduling({ 
        title: "",
        description: "",
        scheduled_date: "",
        scheduled_time: "",
        recipient_phone: "",
        message_content: "",
        template_id: "",
        company_id: currentCompany?.id || "",
        status: "pending"
      });
      setEditingScheduling(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving scheduling:', error);
    }
  };

  const editScheduling = (scheduling: Scheduling) => {
    setEditingScheduling(scheduling);
    setNewScheduling({
      title: scheduling.title,
      description: scheduling.description || "",
      scheduled_date: scheduling.scheduled_date,
      scheduled_time: scheduling.scheduled_time,
      recipient_phone: scheduling.recipient_phone,
      message_content: scheduling.message_content,
      template_id: scheduling.template_id || "",
      company_id: scheduling.company_id || "",
      status: scheduling.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteScheduling = async (schedulingId: string) => {
    if (confirm("Tem certeza que deseja remover este agendamento?")) {
      await deleteScheduling(schedulingId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'sent':
        return "bg-green-100 text-green-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return "Pendente";
      case 'sent':
        return "Enviado";
      case 'failed':
        return "Falhou";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-2">Gerencie os agendamentos de mensagens</p>
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
                {editingScheduling ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Título do agendamento"
                  value={newScheduling.title}
                  onChange={(e) => setNewScheduling({...newScheduling, title: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient_phone">Telefone do Destinatário</Label>
                <Input
                  id="recipient_phone"
                  placeholder="(11) 99999-9999"
                  value={newScheduling.recipient_phone}
                  onChange={(e) => setNewScheduling({...newScheduling, recipient_phone: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Data</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={newScheduling.scheduled_date}
                  onChange={(e) => setNewScheduling({...newScheduling, scheduled_date: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_time">Horário</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={newScheduling.scheduled_time}
                  onChange={(e) => setNewScheduling({...newScheduling, scheduled_time: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="template">Template (Opcional)</Label>
                <Select 
                  value={newScheduling.template_id} 
                  onValueChange={(value) => setNewScheduling({...newScheduling, template_id: value})}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do agendamento"
                  value={newScheduling.description}
                  onChange={(e) => setNewScheduling({...newScheduling, description: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="message_content">Mensagem</Label>
                <Textarea
                  id="message_content"
                  placeholder="Conteúdo da mensagem"
                  value={newScheduling.message_content}
                  onChange={(e) => setNewScheduling({...newScheduling, message_content: e.target.value})}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingScheduling(null);
                setNewScheduling({ 
                  title: "",
                  description: "",
                  scheduled_date: "",
                  scheduled_time: "",
                  recipient_phone: "",
                  message_content: "",
                  template_id: "",
                  company_id: currentCompany?.id || "",
                  status: "pending"
                });
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={saveScheduling} 
                disabled={!newScheduling.title || !newScheduling.recipient_phone || !newScheduling.scheduled_date || !newScheduling.scheduled_time || !newScheduling.message_content}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingScheduling ? "Atualizar" : "Criar"} Agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Lista de Agendamentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedulings.map((scheduling) => (
                <TableRow key={scheduling.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{scheduling.title}</div>
                      {scheduling.description && (
                        <div className="text-sm text-gray-500">{scheduling.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{scheduling.recipient_phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{new Date(scheduling.scheduled_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{scheduling.scheduled_time}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm truncate max-w-32">{scheduling.message_content}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(scheduling.status)}>
                      {getStatusLabel(scheduling.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editScheduling(scheduling)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteScheduling(scheduling.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {schedulings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum agendamento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
