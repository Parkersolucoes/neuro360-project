
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, Clock, Users } from "lucide-react";

interface SchedulingListProps {
  schedulings: any[];
  onEdit: (scheduling: any) => void;
  onDelete: (schedulingId: string) => void;
}

export function SchedulingList({ schedulings, onEdit, onDelete }: SchedulingListProps) {
  if (schedulings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Nenhum agendamento encontrado</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Enviado</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

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
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Agendado para: {formatDateTime(scheduling.scheduled_for)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{scheduling.recipients?.length || 0} destinatário(s)</span>
                  </div>
                  {scheduling.sent_at && (
                    <div className="text-xs text-gray-400">
                      Enviado em: {formatDateTime(scheduling.sent_at)}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Criado em: {formatDateTime(scheduling.created_at)}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onEdit(scheduling)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  disabled={scheduling.status === 'sent'}
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
