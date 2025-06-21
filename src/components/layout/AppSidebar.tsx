
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Settings,
  QrCode,
  Database,
  MessageSquare,
  Calendar,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  CreditCard,
  Package,
  Shield,
  ChevronDown,
  ChevronRight,
  SettingsIcon
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
import { CompanySelector } from "./CompanySelector";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/hooks/useAuth";
import { AdminLoginModal } from "@/components/admin/AdminLoginModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Configuração",
    url: "/configuracao",
    icon: Settings,
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
  {
    title: "Empresas",
    url: "/empresas",
    icon: Building2,
  },
];

const adminMenuItems = [
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
  const { profile, signOut } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const isAdmin = profile?.is_admin || false;

  const handleAdminAccess = () => {
    if (isAdmin) {
      setAdminMenuOpen(!adminMenuOpen);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Sidebar className="border-r border-gray-700 bg-slate-900">
      <SidebarHeader className="p-6 bg-slate-900">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">WhatsApp</h1>
            <p className="text-sm text-gray-300">Automation</p>
            {currentCompany && (
              <p className="text-xs text-blue-400 font-medium mt-1">{currentCompany.name}</p>
            )}
          </div>
        </div>
        <CompanySelector />
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
                      onClick={handleAdminAccess}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:bg-slate-800 hover:text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5" />
                        <span>Painel de Admin</span>
                        {isAdmin && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      {isAdmin && (
                        adminMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {isAdmin && (
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
                  )}
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-slate-900">
        {profile && (
          <div className="mb-3 p-2 bg-slate-800 rounded-lg">
            <p className="text-sm text-white font-medium">{profile.name}</p>
            <p className="text-xs text-gray-400">{profile.email}</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:text-red-400 hover:bg-slate-800"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>

      <AdminLoginModal
        open={showAdminLogin}
        onOpenChange={setShowAdminLogin}
        onLogin={async () => true}
      />
    </Sidebar>
  );
}
