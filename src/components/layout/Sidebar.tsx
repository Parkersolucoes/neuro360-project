
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  Database, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Package,
  BarChart3,
  Calendar,
  QrCode,
  Webhook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelector } from "./CompanySelector";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { userLogin } = useAuth();
  const { currentCompany } = useCompanies();

  // Verificar se o usuário é master (is_admin = '0')
  const isMasterUser = userLogin?.is_admin === '0';

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/empresas", icon: Building2, label: "Empresas" },
    { path: "/usuarios", icon: Users, label: "Usuários" },
    { path: "/planos", icon: Package, label: "Planos" },
    { path: "/sql-server", icon: Database, label: "SQL Server" },
    { path: "/agendamentos", icon: Calendar, label: "Agendamentos" },
    { path: "/whatsapp", icon: QrCode, label: "WhatsApp" },
    { path: "/webhooks", icon: Webhook, label: "Webhooks" },
    { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
    { path: "/configuracao-sistema", icon: Settings, label: "Config. Sistema" },
  ];

  return (
    <div className={`bg-slate-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-blue-400">Visão 360</h1>
            <p className="text-sm text-slate-400">Soluções em Dados</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Company Selector */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700">
          <CompanySelector />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      {!isCollapsed && userLogin && (
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{userLogin.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userLogin.name}</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-slate-400 truncate">{userLogin.email}</p>
                {isMasterUser && (
                  <Badge variant="outline" className="text-xs px-1 py-0 border-yellow-500 text-yellow-400">
                    Master
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
