
import { useState, useEffect } from "react";
import { User } from "@/hooks/useUsers";
import { UserBasicInfoForm } from "./UserBasicInfoForm";
import { UserRoleAndStatusForm } from "./UserRoleAndStatusForm";
import { UserFormActions } from "./UserFormActions";

interface UserFormProps {
  editingUser: User | null;
  onSave: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ 
  editingUser, 
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
      const newData = { ...prev };
      
      if (field === 'is_admin') {
        newData.is_admin = Boolean(value);
      } else if (field === 'status') {
        newData.status = value as 'active' | 'inactive';
      } else {
        // Para todos os outros campos, garantir que são strings
        (newData as any)[field] = String(value);
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
                     formData.department.trim();

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
