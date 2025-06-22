
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  QrCode,
  Database,
  MessageSquare,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  CreditCard,
  Package,
  Shield,
  ChevronDown,
  ChevronRight,
  SettingsIcon,
  Building2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/hooks/useAuth";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { useSystemDescription } from "@/hooks/useSystemDescription";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "QR Code",
    url: "/qrcode",
    icon: QrCode,
  },
  {
    title: "Consultas SQL",
    url: "/consultas",
    icon: Database,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: MessageSquare,
  },
  {
    title: "Agendamento",
    url: "/agendamento",
    icon: Calendar,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
  },
];

const adminMenuItems = [
  {
    title: "Empresas",
    url: "/empresas",
    icon: Building2,
  },
  {
    title: "Planos",
    url: "/planos",
    icon: Package,
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: CreditCard,
  },
  {
    title: "Config. do Sistema",
    url: "/configuracao-sistema",
    icon: SettingsIcon,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { currentCompany } = useCompanies();
  const { userLogin, signOut } = useAuth();
  const { config: systemConfig } = useSystemConfig();
  const { systemDescription } = useSystemDescription();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Sidebar className="border-r border-gray-700 bg-slate-900">
      <SidebarHeader className="p-4 bg-slate-900">
        <div className="space-y-4">
          {/* Logo e informações do sistema */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-white truncate">
                {systemConfig?.system_name || "Visão 360"}
              </h1>
              <p className="text-sm text-gray-300 truncate">
                {systemDescription}
              </p>
            </div>
          </div>

          {/* Informações da empresa atual */}
          {currentCompany && (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center space-x-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Empresa Atual
                </span>
              </div>
              <p className="text-sm font-medium text-white truncate">
                {currentCompany.name}
              </p>
            </div>
          )}

          {/* Menu do usuário */}
          <div className="pt-2 border-t border-slate-700">
            <UserMenu />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.url
                          ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                          : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <Collapsible open={adminMenuOpen} onOpenChange={setAdminMenuOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:bg-slate-800 hover:text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5" />
                        <span>Painel Administrativo</span>
                      </div>
                      {adminMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-6 mt-1 space-y-1">
                    {adminMenuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                          <Link 
                            to={item.url} 
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              location.pathname === item.url
                                ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-slate-900">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:text-red-400 hover:bg-slate-800"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
