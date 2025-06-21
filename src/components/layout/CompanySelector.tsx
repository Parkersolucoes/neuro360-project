
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Building2, Check, ChevronsUpDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";

export function CompanySelector() {
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const { companies = [], currentCompany, setCurrentCompany, loading, refetch } = useCompanies();
  const { toast } = useToast();

  // Garantir que companies é sempre um array
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const handleApplySelection = async () => {
    if (!selectedCompany) {
      toast({
        title: "Atenção",
        description: "Selecione uma empresa primeiro",
        variant: "destructive"
      });
      return;
    }

    const company = safeCompanies.find(c => c.id === selectedCompany);
    if (company) {
      setCurrentCompany(company);
      
      // Recarregar dados relacionados à empresa
      await refetch();
      
      toast({
        title: "Sucesso",
        description: `Empresa "${company.name}" selecionada. Dados recarregados.`,
      });
      
      // Recarregar a página para garantir que todos os dados sejam atualizados
      window.location.reload();
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
              className="w-full justify-between text-left"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {currentCompany ? currentCompany.name : "Selecionar empresa..."}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar empresa..." />
              <CommandList>
                <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                <CommandGroup>
                  {safeCompanies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.name}
                      onSelect={() => {
                        setSelectedCompany(company.id === selectedCompany ? "" : company.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCompany === company.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-muted-foreground">{company.document}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      <Button
        onClick={handleApplySelection}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white px-3"
        disabled={!selectedCompany}
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  );
}
