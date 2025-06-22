
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SchedulingForm } from "@/components/agendamentos/SchedulingForm";
import { SchedulingList } from "@/components/agendamentos/SchedulingList";
import { useSchedulingsNew } from "@/hooks/useSchedulingsNew";
import { useCompanies } from "@/hooks/useCompanies";

export default function Agendamentos() {
  const { schedulings, createScheduling, updateScheduling, deleteScheduling, loading } = useSchedulingsNew();
  const { currentCompany } = useCompanies();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingScheduling, setEditingScheduling] = useState<any>(null);

  const handleCreateScheduling = async (schedulingData: any) => {
    try {
      await createScheduling(schedulingData);
      setIsFormDialogOpen(false);
      setEditingScheduling(null);
    } catch (error) {
      console.error('Error creating scheduling:', error);
    }
  };

  const handleUpdateScheduling = async (schedulingData: any) => {
    if (!editingScheduling) return;
    
    try {
      await updateScheduling(editingScheduling.id, schedulingData);
      setIsFormDialogOpen(false);
      setEditingScheduling(null);
    } catch (error) {
      console.error('Error updating scheduling:', error);
    }
  };

  const handleEditScheduling = (scheduling: any) => {
    setEditingScheduling(scheduling);
    setIsFormDialogOpen(true);
  };

  const handleDeleteScheduling = async (schedulingId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await deleteScheduling(schedulingId);
      } catch (error) {
        console.error('Error deleting scheduling:', error);
      }
    }
  };

  const handleNewSchedulingClick = () => {
    setEditingScheduling(null);
    setIsFormDialogOpen(true);
  };

  const resetForm = () => {
    setEditingScheduling(null);
    setIsFormDialogOpen(false);
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
          <p className="text-gray-600 mt-2">Gerencie seus agendamentos de mensagens</p>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleNewSchedulingClick}
              disabled={!currentCompany}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingScheduling ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
            </DialogHeader>
            <SchedulingForm
              scheduling={editingScheduling}
              onSubmit={editingScheduling ? handleUpdateScheduling : handleCreateScheduling}
              onCancel={resetForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!currentCompany && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione uma empresa no menu lateral para gerenciar agendamentos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Agendamentos ({schedulings.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SchedulingList
            schedulings={schedulings}
            onEdit={handleEditScheduling}
            onDelete={handleDeleteScheduling}
          />
        </CardContent>
      </Card>
    </div>
  );
}
