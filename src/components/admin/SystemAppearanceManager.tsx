
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { SystemInfoForm } from "./appearance/SystemInfoForm";

export function SystemAppearanceManager() {
  const { config, saveConfig, loading } = useSystemConfig();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    system_name: "Visão 360 - Soluções em Dados",
    system_description: "Plataforma completa para análise e gestão de dados empresariais"
  });

  // Update form data when config is loaded
  useEffect(() => {
    if (config) {
      setFormData({
        system_name: config.system_name || "Visão 360 - Soluções em Dados",
        system_description: config.system_description || "Plataforma completa para análise e gestão de dados empresariais"
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveConfig(formData);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Aparência do Sistema</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <SystemInfoForm
            systemName={formData.system_name}
            systemDescription={formData.system_description}
            onSystemNameChange={(value) => setFormData(prev => ({ ...prev, system_name: value }))}
            onSystemDescriptionChange={(value) => setFormData(prev => ({ ...prev, system_description: value }))}
          />

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>As alterações aparecerão na tela de login</span>
            </div>
            <Button 
              type="submit" 
              className="bg-slate-800 hover:bg-slate-900"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
