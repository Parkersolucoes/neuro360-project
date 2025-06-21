
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertCircle } from "lucide-react";

interface CompanyAlertProps {
  currentCompany: { name: string } | null;
}

export function CompanyAlert({ currentCompany }: CompanyAlertProps) {
  return (
    <Alert className="mb-6">
      <Building2 className="h-4 w-4" />
      <AlertDescription>
        {currentCompany ? (
          <span>Configurações para: <strong>{currentCompany.name}</strong></span>
        ) : (
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Selecione uma empresa no seletor do menu lateral para gerenciar as configurações
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
