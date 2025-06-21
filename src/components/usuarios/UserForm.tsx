
import { useState, useEffect } from "react";
import { User } from "@/hooks/useUsers";
import { Company } from "@/hooks/useCompanies";
import { UserBasicInfoForm } from "./UserBasicInfoForm";
import { UserRoleAndStatusForm } from "./UserRoleAndStatusForm";
import { UserCompaniesSection } from "./UserCompaniesSection";
import { UserFormActions } from "./UserFormActions";

interface UserFormProps {
  editingUser: User | null;
  companies: Company[];
  selectedCompanies: string[];
  primaryCompany: string;
  onSelectedCompaniesChange: (companies: string[]) => void;
  onPrimaryCompanyChange: (company: string) => void;
  onSave: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ 
  editingUser, 
  companies, 
  selectedCompanies, 
  primaryCompany,
  onSelectedCompaniesChange,
  onPrimaryCompanyChange,
  onSave, 
  onCancel 
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    role: "user",
    department: "",
    is_admin: false,
    status: "active" as 'active' | 'inactive'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        whatsapp: editingUser.whatsapp,
        role: editingUser.role,
        department: editingUser.department,
        is_admin: Boolean(editingUser.is_admin),
        status: editingUser.status
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        role: "user",
        department: "",
        is_admin: false,
        status: "active"
      });
    }
  }, [editingUser]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    console.log('Field changed:', field, 'Value:', value, 'Type:', typeof value);
    
    setFormData(prev => {
      const updates: Partial<typeof prev> = {};
      
      if (field === 'is_admin') {
        // Garantir que is_admin seja sempre boolean
        updates.is_admin = Boolean(value);
      } else if (field === 'status') {
        updates.status = value as 'active' | 'inactive';
      } else {
        // Para outros campos string
        (updates as any)[field] = String(value);
      }
      
      return { ...prev, ...updates };
    });
  };

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
    if (isSaving) return;
    
    // Validar se há pelo menos uma empresa selecionada
    if (selectedCompanies.length === 0) {
      alert('Selecione pelo menos uma empresa para o usuário.');
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('Submitting form data:', formData);
      console.log('Selected companies:', selectedCompanies);
      console.log('Primary company:', primaryCompany);
      
      // Garantir que todos os campos obrigatórios estão preenchidos
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        role: formData.role,
        department: formData.department.trim(),
        is_admin: Boolean(formData.is_admin),
        status: formData.status
      };
      
      await onSave(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.name.trim() && 
                     formData.email.trim() && 
                     formData.phone.trim() && 
                     formData.whatsapp.trim() && 
                     formData.department.trim() &&
                     selectedCompanies.length > 0;

  return (
    <div className="space-y-6 bg-white">
      <UserBasicInfoForm 
        formData={formData}
        onChange={handleFieldChange}
      />

      <UserRoleAndStatusForm 
        formData={formData}
        onChange={handleFieldChange}
      />

      <UserCompaniesSection
        companies={companies}
        selectedCompanies={selectedCompanies}
        primaryCompany={primaryCompany}
        onCompanyToggle={handleCompanyToggle}
        onPrimaryCompanyChange={handlePrimaryCompanyChange}
      />

      <UserFormActions
        isFormValid={isFormValid}
        isSaving={isSaving}
        editingUser={!!editingUser}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </div>
  );
}
