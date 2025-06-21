
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { User } from "@/hooks/useUsers";
import { Company } from "@/hooks/useCompanies";

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  companies: Company[];
  selectedCompanies: string[];
  primaryCompany: string;
  onSelectedCompaniesChange: (companies: string[]) => void;
  onPrimaryCompanyChange: (company: string) => void;
  onSave: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export function UserDialog({
  isOpen,
  onOpenChange,
  editingUser,
  companies,
  selectedCompanies,
  primaryCompany,
  onSelectedCompaniesChange,
  onPrimaryCompanyChange,
  onSave,
  onCancel
}: UserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          editingUser={editingUser}
          companies={companies}
          selectedCompanies={selectedCompanies}
          primaryCompany={primaryCompany}
          onSelectedCompaniesChange={onSelectedCompaniesChange}
          onPrimaryCompanyChange={onPrimaryCompanyChange}
          onSave={onSave}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
