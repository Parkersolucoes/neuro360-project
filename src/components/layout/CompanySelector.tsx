
import { useState } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCompanies } from '@/hooks/useCompanies';

export function CompanySelector() {
  const [open, setOpen] = useState(false);
  const { companies, currentCompany, setCurrentCompany } = useCompanies();

  if (companies.length <= 1) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
        >
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4 text-blue-400" />
            <span className="truncate">
              {currentCompany ? currentCompany.name : "Selecionar empresa..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 bg-slate-800 border-slate-700" align="start">
        <Command className="bg-slate-800">
          <CommandInput placeholder="Buscar empresa..." className="border-0 text-white" />
          <CommandEmpty className="text-gray-400">Nenhuma empresa encontrada.</CommandEmpty>
          <CommandGroup className="bg-slate-800">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={company.name}
                onSelect={() => {
                  setCurrentCompany(company);
                  setOpen(false);
                }}
                className="hover:bg-slate-700 text-white"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentCompany?.id === company.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium text-white">{company.name}</span>
                  <span className="text-xs text-gray-400 capitalize">{company.status}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
