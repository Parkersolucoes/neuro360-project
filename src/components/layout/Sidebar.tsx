
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
  Webhook,
  Shield,
  ChevronDown,
  ChevronUp,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelector } from "./CompanySelector";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const location = useLocation();
  const { userLogin, logout } = useAuth();
  const { currentCompany } = useCompanies();

  // Verificar se o usuário é master (is_admin = '0')
  const isMasterUser = userLogin?.is_admin === '0';

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/agendamentos", icon: Calendar, label: "Agendamentos" },
    { path: "/consultas-sql", icon: Database, label: "Consultas SQL" },
    { path: "/whatsapp", icon: QrCode, label: "WhatsApp" },
    { path: "/webhooks", icon: Webhook, label: "Webhooks" },
    { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
    { path: "/usuarios", icon: Users, label: "Usuários" },
  ];

  const adminMenuItems = [
    { path: "/configuracao-sistema", icon: Settings, label: "Config. Sistema" },
    { path: "/empresas", icon: Building2, label: "Empresas" },
    { path: "/planos", icon: Package, label: "Planos" },
  ];

  // Verificar se algum item do menu admin está ativo
  const isAdminMenuActive = adminMenuItems.some(item => location.pathname === item.path);

  // Abrir automaticamente o menu admin se algum item estiver ativo
  useEffect(() => {
    if (isAdminMenuActive) {
      setIsAdminMenuOpen(true);
    }
  }, [isAdminMenuActive]);

  const handleLogout = () => {
    logout();
  };

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
            
            // Se for usuário master e o item for "Usuários", desabilitar
            const isDisabled = isMasterUser && item.label === "Usuários";

            return (
              <li key={item.path}>
                {isDisabled ? (
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg cursor-not-allowed opacity-50 text-gray-500">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                ) : (
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
                )}
              </li>
            );
          })}

          {/* Menu Administrativo */}
          {isMasterUser && (
            <li>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isAdminMenuActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>Painel Administrativo</span>}
                  </div>
                  {!isCollapsed && (
                    isAdminMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Submenu Administrativo */}
                {isAdminMenuOpen && !isCollapsed && (
                  <ul className="mt-2 ml-6 space-y-1">
                    {adminMenuItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;

                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                              isActive 
                                ? 'bg-blue-500 text-white' 
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          )}

          {/* Botão de Sair */}
          <li>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-slate-300 hover:bg-red-600 hover:text-white"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>Sair</span>}
              </button>
            </div>
          </li>
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
