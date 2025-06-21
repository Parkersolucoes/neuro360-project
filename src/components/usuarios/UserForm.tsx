
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
    is_master: false,
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
        is_master: Boolean(editingUser.is_master),
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
        is_master: false,
        status: "active"
      });
    }
  }, [editingUser]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    console.log('Field changed:', field, 'Value:', value, 'Type:', typeof value);
    
    setFormData(prev => {
      const newData = { ...prev };
      
      // Tratar campos boolean especificamente
      if (field === 'is_admin') {
        newData.is_admin = typeof value === 'boolean' ? value : value === 'true' || value === true;
      } else if (field === 'is_master') {
        newData.is_master = typeof value === 'boolean' ? value : value === 'true' || value === true;
      } else if (field === 'status') {
        newData.status = value as 'active' | 'inactive';
      } else {
        // Para campos string
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
        is_admin: formData.is_admin,
        is_master: formData.is_master,
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
