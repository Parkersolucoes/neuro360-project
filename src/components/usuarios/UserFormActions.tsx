
import { Button } from "@/components/ui/button";

interface UserFormActionsProps {
  isFormValid: boolean;
  isSaving: boolean;
  editingUser: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function UserFormActions({ 
  isFormValid, 
  isSaving, 
  editingUser, 
  onSave, 
  onCancel 
}: UserFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 mt-6">
      <Button variant="outline" onClick={onCancel} className="border-blue-200 text-blue-600 hover:bg-blue-50">
        Cancelar
      </Button>
      <Button 
        onClick={onSave} 
        disabled={!isFormValid || isSaving}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isSaving ? "Salvando..." : (editingUser ? "Atualizar" : "Criar")} Usuário
      </Button>
    </div>
  );
}
