
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { SystemInfoForm } from "./appearance/SystemInfoForm";
import { ImageUploadSection } from "./appearance/ImageUploadSection";

export function SystemAppearanceManager() {
  const { config, saveConfig, uploadImage, loading } = useSystemConfig();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    system_name: "360 Solutions",
    system_description: "Automação WhatsApp Inteligente",
    login_background_image: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Update form data when config is loaded
  useEffect(() => {
    if (config) {
      setFormData({
        system_name: config.system_name || "360 Solutions",
        system_description: config.system_description || "Automação WhatsApp Inteligente",
        login_background_image: config.login_background_image || ""
      });
    }
  }, [config]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload da imagem
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        login_background_image: imageUrl
      }));

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });

      // Limpar preview em caso de erro
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SystemInfoForm
              systemName={formData.system_name}
              systemDescription={formData.system_description}
              onSystemNameChange={(value) => setFormData(prev => ({ ...prev, system_name: value }))}
              onSystemDescriptionChange={(value) => setFormData(prev => ({ ...prev, system_description: value }))}
            />

            <ImageUploadSection
              currentImage={formData.login_background_image}
              previewImage={previewImage}
              isUploading={isUploading}
              onImageUpload={handleImageUpload}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>As alterações aparecerão na tela de login</span>
            </div>
            <Button 
              type="submit" 
              className="bg-slate-800 hover:bg-slate-900"
              disabled={isUploading}
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
