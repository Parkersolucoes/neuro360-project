
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

  // Garantir que companies é sempre um array
  const safeCompanies = Array.isArray(companies) ? companies : [];
  
  console.log('CompanySelector: Safe companies:', safeCompanies);
  console.log('CompanySelector: Current company:', currentCompany);
  console.log('CompanySelector: Is master user:', isMasterUser);

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
      <div className="flex items-center space-x-2 px-3 py-2 w-full">
        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-500 truncate">Carregando empresas...</span>
      </div>
    );
  }

  if (safeCompanies.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 w-full">
        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-500 truncate">Nenhuma empresa</span>
      </div>
    );
  }

  if (safeCompanies.length === 1) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 w-full">
        <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span className="text-sm font-medium truncate text-white">{safeCompanies[0].name}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left bg-slate-800 hover:bg-slate-700 border-slate-600 text-yellow-400 hover:text-yellow-300 h-auto py-2 px-3"
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Building2 className="w-4 h-4 flex-shrink-0 text-yellow-400" />
              <span className="truncate text-sm">
                {currentCompany ? currentCompany.name : "Selecionar empresa..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 bg-slate-800 border-slate-600" align="start">
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
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{company.name}</span>
                      <span className="text-xs text-gray-400 truncate">{company.document}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
