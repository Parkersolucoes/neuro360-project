
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordService } from "@/services/passwordService";
import { User } from "@/hooks/useUsers";

interface PasswordGeneratorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function PasswordGeneratorDialog({
  isOpen,
  onOpenChange,
  user
}: PasswordGeneratorDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePassword = async () => {
    if (!user) return;

    try {
      setIsGenerating(true);
      console.log('Generating password for user:', user.id);
      
      const newPassword = await PasswordService.generateUserPassword(user.id);
      
      if (newPassword) {
        setPassword(newPassword);
        setShowPassword(true);
        
        toast({
          title: "Senha gerada com sucesso!",
          description: `Nova senha criada para ${user.name}`,
        });
      }
    } catch (error) {
      console.error('Error generating password:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao gerar senha";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Copiado!",
        description: "Senha copiada para a área de transferência",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao copiar senha",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <span>Gerar Senha</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {user && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Usuário:</p>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}

          {!password ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Clique no botão abaixo para gerar uma nova senha para este usuário.
              </p>
              <Button 
                onClick={generatePassword}
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar Nova Senha
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <Label htmlFor="generated-password" className="text-green-800 font-medium">
                  Senha Gerada
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="generated-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    readOnly
                    className="bg-white border-green-300 font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                    className="border-green-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="border-green-300"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Anote esta senha em local seguro. 
                  O usuário precisará dela para fazer login no sistema.
                </p>
              </div>

              <div className="flex justify-between space-x-2">
                <Button 
                  variant="outline" 
                  onClick={generatePassword}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Gerar Nova
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleClose}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                >
                  Concluir
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
