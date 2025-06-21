
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import { Company } from "@/hooks/useCompanies";

interface CompanyStatsProps {
  companies: Company[];
}

export function CompanyStats({ companies }: CompanyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Empresas Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {companies.filter(c => c.status === "active").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-blue-600">
                {companies.length * 5}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
