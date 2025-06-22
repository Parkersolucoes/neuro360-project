
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, MessageSquare, Users, Clock } from "lucide-react";
import { Scheduling } from "@/hooks/useSchedulingsNew";

interface SchedulingListProps {
  schedulings: Scheduling[];
  onEdit: (scheduling: Scheduling) => void;
  onDelete: (schedulingId: string) => void;
}

export function SchedulingList({ schedulings, onEdit, onDelete }: SchedulingListProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      sent: { label: "Enviado", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-800" },
      failed: { label: "Falhou", className: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  const getRecipientCount = (recipients: any[]) => {
    if (!Array.isArray(recipients)) return 0;
    return recipients.length;
  };

  if (schedulings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Nenhum agendamento encontrado</p>
        <p className="text-sm text-gray-400 mt-1">Clique em "Novo Agendamento" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedulings.map((scheduling) => (
        <Card key={scheduling.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">{scheduling.name}</h4>
                  {getStatusBadge(scheduling.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Agendado: {formatDateTime(scheduling.scheduled_for)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>{getRecipientCount(scheduling.recipients)} destinatário(s)</span>
                  </div>
                  
                  {scheduling.sent_at && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span>Enviado: {formatDateTime(scheduling.sent_at)}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-md p-3 mb-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Mensagem:</div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {scheduling.message_content}
                  </p>
                </div>
                
                <p className="text-xs text-gray-400">
                  Criado em: {formatDateTime(scheduling.created_at)}
                </p>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onEdit(scheduling)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => onDelete(scheduling.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
