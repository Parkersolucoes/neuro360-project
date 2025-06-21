
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Building2, Check, ChevronsUpDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useCompanies";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";

export function CompanySelector() {
  const [open, setOpen] = useState(false);
  const { companies = [], currentCompany, setCurrentCompany, loading, refetch } = useCompanies();
  const { isMasterUser } = useAdminAuth();
  const { toast } = useToast();

  // Só mostrar o seletor para usuários master
  if (!isMasterUser) {
    return null;
  }

  // Garantir que companies é sempre um array
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const handleCompanySelect = async (companyId: string) => {
    console.log('CompanySelector: Selecting company:', companyId);
    
    const company = safeCompanies.find(c => c.id === companyId);
    if (company) {
      console.log('CompanySelector: Setting company:', company);
      
      try {
        // Definir a empresa atual imediatamente
        setCurrentCompany(company);
        
        // Salvar no localStorage para persistência
        localStorage.setItem('selectedCompanyId', companyId);
        
        setOpen(false);
        
        // Aguardar um pouco e fazer refetch
        setTimeout(async () => {
          await refetch();
        }, 100);
        
        toast({
          title: "Sucesso",
          description: `Empresa "${company.name}" selecionada com sucesso.`,
        });
        
        console.log('CompanySelector: Company selection completed successfully');
      } catch (error) {
        console.error('CompanySelector: Error selecting company:', error);
        toast({
          title: "Erro",
          description: "Erro ao selecionar empresa",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-2 py-1.5">
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Carregando empresas...</span>
      </div>
    );
  }

  if (safeCompanies.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-2 py-1.5">
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Nenhuma empresa</span>
      </div>
    );
  }

  if (safeCompanies.length === 1) {
    return (
      <div className="flex items-center space-x-2 px-2 py-1.5">
        <Building2 className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium truncate">{safeCompanies[0].name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-left bg-slate-800 hover:bg-slate-700 border-slate-600 text-yellow-400 hover:text-yellow-300"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Building2 className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                <span className="truncate">
                  {currentCompany ? currentCompany.name : "Selecionar empresa..."}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 bg-slate-800 border-slate-600" align="start">
            <Command className="bg-slate-800">
              <CommandInput 
                placeholder="Buscar empresa..." 
                className="text-yellow-100 placeholder:text-gray-400"
              />
              <CommandList>
                <CommandEmpty className="text-gray-400 py-6 text-center">
                  Nenhuma empresa encontrada.
                </CommandEmpty>
                <CommandGroup>
                  {safeCompanies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.id}
                      onSelect={() => handleCompanySelect(company.id)}
                      className="text-yellow-100 hover:bg-slate-700 hover:text-yellow-300"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-yellow-400",
                          currentCompany?.id === company.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-gray-400">{company.document}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
