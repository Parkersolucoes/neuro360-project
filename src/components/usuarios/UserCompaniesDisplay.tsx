
import { Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface UserCompaniesDisplayProps {
  userCompanyNames: string;
}

export function UserCompaniesDisplay({ userCompanyNames }: UserCompaniesDisplayProps) {
  const companies = userCompanyNames.split(', ').filter(company => company !== 'Nenhuma empresa');
  
  if (companies.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-base font-medium flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          <span>Empresas Vinculadas</span>
        </Label>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm text-gray-500">Nenhuma empresa vinculada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium flex items-center space-x-2">
        <Building2 className="w-4 h-4 text-blue-500" />
        <span>Empresas Vinculadas</span>
      </Label>
      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
        <div className="flex flex-wrap gap-2">
          {companies.map((company, index) => {
            const isPrimary = company.includes('(Principal)');
            const companyName = company.replace(' (Principal)', '');
            
            return (
              <Badge 
                key={index} 
                variant={isPrimary ? "default" : "secondary"}
                className={isPrimary ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}
              >
                {companyName}
                {isPrimary && <span className="ml-1 text-xs">(Principal)</span>}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
