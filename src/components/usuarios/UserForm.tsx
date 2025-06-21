
import { useState, useEffect } from "react";
import { User } from "@/hooks/useUsers";
import { UserBasicInfoForm } from "./UserBasicInfoForm";
import { UserRoleAndStatusForm } from "./UserRoleAndStatusForm";
import { UserFormActions } from "./UserFormActions";
import { UserCompaniesDisplay } from "./UserCompaniesDisplay";

interface UserFormProps {
  editingUser: User | null;
  onSave: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  getUserCompanyNames?: (userId: string) => string;
}

export function UserForm({ 
  editingUser, 
  onSave, 
  onCancel,
  getUserCompanyNames
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    role: "user",
    department: "",
    is_admin: "1", // String: '0' = recebe alertas, '1' = não recebe alertas
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
        is_admin: editingUser.is_admin,
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
        is_admin: "1", // Default para não receber alertas
        status: "active"
      });
    }
  }, [editingUser]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    console.log('Field changed:', field, 'Value:', value, 'Type:', typeof value);
    
    setFormData(prev => {
      const newData = { ...prev };
      
      // Tratar campos específicos
      if (field === 'is_admin') {
        // Converter boolean para string: true = '0' (recebe alertas), false = '1' (não recebe alertas)
        newData.is_admin = value === true ? '0' : '1';
      } else if (field === 'status') {
        newData.status = String(value) as 'active' | 'inactive';
      } else {
        // Para campos string
        if (field === 'name' || field === 'email' || field === 'phone' || field === 'whatsapp' || field === 'role' || field === 'department') {
          (newData as any)[field] = String(value);
        }
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      console.log('Submitting form data:', formData);
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        role: formData.role,
        department: formData.department.trim(),
        is_admin: formData.is_admin, // Já é string
        status: formData.status
      };
      
      await onSave(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = Boolean(formData.name.trim() && 
                     formData.email.trim() && 
                     formData.phone.trim() && 
                     formData.whatsapp.trim() && 
                     formData.department.trim());

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

      {editingUser && getUserCompanyNames && (
        <UserCompaniesDisplay 
          userCompanyNames={getUserCompanyNames(editingUser.id)}
        />
      )}

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
