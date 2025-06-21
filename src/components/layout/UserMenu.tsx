import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  KeyRound, 
  Camera, 
  Building2, 
  LogOut,
  ChevronDown 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CompanySelector } from "./CompanySelector";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useCompanies } from "@/hooks/useCompanies";

export function UserMenu() {
  const { userLogin, signOut } = useAuth();
  const { isMasterUser } = useAdminAuth();
  const { companies } = useCompanies();
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showUserEditDialog, setShowUserEditDialog] = useState(false);

  if (!userLogin) return null;

  const userInitials = userLogin.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    signOut();
  };

  // Mostrar seletor de empresa se for master OU se usuário normal tem mais de uma empresa
  const shouldShowCompanySelector = isMasterUser || (Array.isArray(companies) && companies.length > 1);

  const handleCloseCompanyDialog = () => {
    setShowCompanyDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full h-auto p-3 justify-start text-left bg-yellow-400 hover:bg-yellow-500 border border-yellow-500">
            <div className="flex items-center space-x-3 w-full">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{userLogin.name}</p>
                <p className="text-xs text-gray-700 truncate">{userLogin.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-700 flex-shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowUserEditDialog(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Alterar Usuário</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
            <Camera className="mr-2 h-4 w-4" />
            <span>Alterar Foto</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Trocar Senha</span>
          </DropdownMenuItem>
          
          {shouldShowCompanySelector && (
            <DropdownMenuItem onClick={() => setShowCompanyDialog(true)}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Selecionar Empresa</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para seleção de empresa */}
      <Dialog open={showCompanyDialog} onOpenChange={handleCloseCompanyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Empresa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CompanySelector />
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseCompanyDialog}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para alterar usuário */}
      <Dialog open={showUserEditDialog} onOpenChange={setShowUserEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Dados do Usuário</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Funcionalidade de alteração de dados do usuário será implementada em breve.
            </p>
            <Button 
              onClick={() => setShowUserEditDialog(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para trocar senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Trocar Senha</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Funcionalidade de troca de senha será implementada em breve.
            </p>
            <Button 
              onClick={() => setShowPasswordDialog(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para alterar foto */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Foto do Perfil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Funcionalidade de upload de foto será implementada em breve.
            </p>
            <Button 
              onClick={() => setShowProfileDialog(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
