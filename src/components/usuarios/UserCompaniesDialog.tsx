
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/hooks/useUsers";
import { Company } from "@/hooks/useCompanies";
import { UserCompaniesSection } from "./UserCompaniesSection";

interface UserCompaniesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  companies: Company[];
  selectedCompanies: string[];
  primaryCompany: string;
  onSelectedCompaniesChange: (companies: string[]) => void;
  onPrimaryCompanyChange: (company: string) => void;
  onSave: (userId: string, companies: string[], primaryCompany: string) => Promise<void>;
}

export function UserCompaniesDialog({
  isOpen,
  onOpenChange,
  user,
  companies,
  selectedCompanies,
  primaryCompany,
  onSelectedCompaniesChange,
  onPrimaryCompanyChange,
  onSave
}: UserCompaniesDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleCompanyToggle = (companyId: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedCompanies, companyId];
      if (selectedCompanies.length === 0) {
        onPrimaryCompanyChange(companyId);
      }
    } else {
      newSelected = selectedCompanies.filter(id => id !== companyId);
      if (primaryCompany === companyId) {
        onPrimaryCompanyChange(newSelected.length > 0 ? newSelected[0] : '');
      }
    }
    onSelectedCompaniesChange(newSelected);
  };

  const handlePrimaryCompanyChange = (companyId: string, checked: boolean) => {
    if (checked && selectedCompanies.includes(companyId)) {
      onPrimaryCompanyChange(companyId);
    }
  };

  const handleSave = async () => {
    if (!user || isSaving) return;
    
    try {
      setIsSaving(true);
      await onSave(user.id, selectedCompanies, primaryCompany);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving user companies:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Gerenciar Empresas - {user?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <UserCompaniesSection
            companies={companies}
            selectedCompanies={selectedCompanies}
            primaryCompany={primaryCompany}
            onCompanyToggle={handleCompanyToggle}
            onPrimaryCompanyChange={handlePrimaryCompanyChange}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
