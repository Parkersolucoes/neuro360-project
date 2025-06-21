
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2 } from "lucide-react";
import { Company } from "@/hooks/useCompanies";

interface UserCompaniesSectionProps {
  companies: Company[];
  selectedCompanies: string[];
  primaryCompany: string;
  onCompanyToggle: (companyId: string, checked: boolean) => void;
  onPrimaryCompanyChange: (companyId: string, checked: boolean) => void;
}

export function UserCompaniesSection({ 
  companies, 
  selectedCompanies, 
  primaryCompany, 
  onCompanyToggle, 
  onPrimaryCompanyChange 
}: UserCompaniesSectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium flex items-center space-x-2">
        <Building2 className="w-4 h-4 text-blue-500" />
        <span>Empresas</span>
      </Label>
      <div className="border border-blue-200 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
        {companies.map((company) => (
          <div key={company.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`company-${company.id}`}
                checked={selectedCompanies.includes(company.id)}
                onCheckedChange={(checked) => onCompanyToggle(company.id, checked as boolean)}
                className="border-blue-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label htmlFor={`company-${company.id}`} className="flex-1">
                {company.name}
              </Label>
            </div>
            {selectedCompanies.includes(company.id) && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`primary-${company.id}`}
                  checked={primaryCompany === company.id}
                  onCheckedChange={(checked) => onPrimaryCompanyChange(company.id, checked as boolean)}
                  className="border-blue-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor={`primary-${company.id}`} className="text-sm text-blue-600">
                  Principal
                </Label>
              </div>
            )}
          </div>
        ))}
        {companies.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma empresa cadastrada
          </p>
        )}
      </div>
    </div>
  );
}
