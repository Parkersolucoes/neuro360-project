
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { User } from "@/hooks/useUsers";

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  onSave: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  getUserCompanyNames?: (userId: string) => string;
}

export function UserDialog({
  isOpen,
  onOpenChange,
  editingUser,
  onSave,
  onCancel,
  getUserCompanyNames
}: UserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {editingUser ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UserForm
            editingUser={editingUser}
            onSave={onSave}
            onCancel={onCancel}
            getUserCompanyNames={getUserCompanyNames}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
