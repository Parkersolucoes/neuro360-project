import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Package } from "lucide-react";
import { useSystemUpdates } from "@/hooks/useSystemUpdates";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SystemUpdatesManager() {
  const { updates, loading, createUpdate, updateUpdate, deleteUpdate } = useSystemUpdates();
  const { userLogin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    version: "",
    update_date: new Date().toISOString().split('T')[0],
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUpdate) {
      await updateUpdate(editingUpdate.id, formData);
    } else {
      await createUpdate(formData);
    }
    
    setFormData({
      title: "",
      description: "",
      version: "",
      update_date: new Date().toISOString().split('T')[0],
      is_active: true
    });
    setShowForm(false);
    setEditingUpdate(null);
  };

  const handleEdit = (update: any) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title,
      description: update.description,
      version: update.version || "",
      update_date: update.update_date,
      is_active: update.is_active
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUpdate(null);
    setFormData({
      title: "",
      description: "",
      version: "",
      update_date: new Date().toISOString().split('T')[0],
      is_active: true
    });
  };

  if (!userLogin?.is_admin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Atualizações do Sistema</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Atualização
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUpdate ? "Editar Atualização" : "Nova Atualização"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título da atualização"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="v1.0.0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva as melhorias e correções"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update_date">Data da Atualização</Label>
                  <Input
                    id="update_date"
                    type="date"
                    value={formData.update_date}
                    onChange={(e) => setFormData({...formData, update_date: e.target.value})}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Ativa</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingUpdate ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{update.title}</h3>
                    {update.version && (
                      <Badge variant="outline" className="text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        {update.version}
                      </Badge>
                    )}
                    <Badge className={update.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {update.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{update.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(update.update_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(update)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteUpdate(update.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {updates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atualização</h3>
              <p className="text-gray-600">Crie sua primeira atualização do sistema.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
